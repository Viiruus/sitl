import { z } from 'zod'
import { prisma } from '../../../utils/prisma'

const stringListSchema = z.array(z.string().trim().min(1)).optional()

const imageUrlSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return false
    if (value.startsWith('/uploads/') || value.startsWith('/api/moniteurs/uploads/')) return true
    if (value.startsWith('data:')) return true
    try {
      const url = new URL(value)
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }, { message: 'URL d’image invalide' })

const coverImageSchema = imageUrlSchema.or(z.literal(null)).optional()

const galleryImageSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().trim().optional(),
  position: z.number().int().min(0).optional(),
})

const bodySchema = z
  .object({
    titre: z.string().trim().min(3),
    discipline: z.enum(['FALAISE', 'GRANDE_VOIE', 'BLOC', 'TRAD', 'VIA_FERRATA']),
    lieuLabel: z.string().trim().min(3),
    prixParPersonne: z.number().int().min(0),
    jours: z.number().int().min(1).max(30),
    placesMax: z.number().int().min(1).max(20),
    sousTitre: z.string().trim().optional(),
    transportLabel: z.string().trim().optional(),
    niveauMinimum: z.string().trim().optional(),
    descriptionCourte: z.string().trim().optional(),
    descriptionLongue: z.string().trim().optional(),
    ageMin: z.number().int().min(0).max(120).nullable().optional(),
    ageMax: z.number().int().min(0).max(120).nullable().optional(),
    autonomieMini: z.string().trim().optional(),
    coverImageUrl: coverImageSchema,
    equipementRequis: stringListSchema,
    equipementFourni: stringListSchema,
    hebergementDetails: z.string().trim().optional(),
    inclus: z.string().trim().optional(),
    nonInclus: z.string().trim().optional(),
    objectifs: z.string().trim().optional(),
    prerequis: stringListSchema,
    repasLabel: z.string().trim().optional(),
    estPublie: z.boolean().optional(),
    images: z.array(galleryImageSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.estPublie) {
      return
    }

    const assertFilled = (value: string | undefined | null, path: (string | number)[], message: string) => {
      if (!value || !value.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message,
        })
      }
    }

    if (!data.sousTitre || data.sousTitre.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sousTitre'],
        message: 'Ajoute un sous-titre (3 caractères min).',
      })
    }
    assertFilled(data.niveauMinimum, ['niveauMinimum'], 'Précise le niveau minimum.')
    if (!data.descriptionCourte || data.descriptionCourte.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['descriptionCourte'],
        message: 'Ajoute une description courte (10 caractères min).',
      })
    }
    assertFilled(data.coverImageUrl, ['coverImageUrl'], 'Ajoute une image de couverture.')
    if (!data.equipementRequis || data.equipementRequis.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['equipementRequis'],
        message: 'Ajoute au moins un élément pour l’équipement requis.',
      })
    }
    assertFilled(data.inclus, ['inclus'], 'Décris ce qui est inclus.')
    assertFilled(data.nonInclus, ['nonInclus'], 'Décris ce qui n’est pas inclus.')
  })

const listOrNull = (value?: string[] | null) => {
  if (!value || value.length === 0) return null
  return value
}

const valueOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const slug = event.context.params?.slug

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }
  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const body = bodySchema.parse(await readBody(event))
  const db = await prisma()

  const existing = await db.aventure.findFirst({
    where: { slug, guideId: Number(session.user.id) },
    select: { id: true },
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  const updated = await db.$transaction(async (tx) => {
    const updatedAventure = await tx.aventure.update({
      where: { id: existing.id },
      data: {
        titre: body.titre,
        discipline: body.discipline,
        lieuLabel: body.lieuLabel,
        prixParPersonne: body.prixParPersonne,
        jours: body.jours,
        placesMax: body.placesMax,
        sousTitre: valueOrNull(body.sousTitre ?? null),
        transportLabel: valueOrNull(body.transportLabel ?? null),
        niveauMinimum: valueOrNull(body.niveauMinimum ?? null),
        descriptionCourte: valueOrNull(body.descriptionCourte ?? null),
        descriptionLongue: valueOrNull(body.descriptionLongue ?? null),
        ageMin: body.ageMin ?? null,
        ageMax: body.ageMax ?? null,
        autonomieMini: valueOrNull(body.autonomieMini ?? null),
        coverImageUrl: body.coverImageUrl?.trim() || null,
        equipementRequis: listOrNull(body.equipementRequis ?? null),
        equipementFourni: listOrNull(body.equipementFourni ?? null),
        hebergementDetails: valueOrNull(body.hebergementDetails ?? null),
        inclus: valueOrNull(body.inclus ?? null),
        nonInclus: valueOrNull(body.nonInclus ?? null),
        objectifs: valueOrNull(body.objectifs ?? null),
        prerequis: listOrNull(body.prerequis ?? null),
        repasLabel: valueOrNull(body.repasLabel ?? null),
        estPublie: body.estPublie ?? false,
      },
      select: {
        id: true,
        slug: true,
        estPublie: true,
      },
    })

    if (body.images) {
      await tx.aventureImage.deleteMany({ where: { aventureId: existing.id } })
      if (body.images.length) {
        await tx.aventureImage.createMany({
          data: body.images.map((img, index) => ({
            aventureId: existing.id,
            url: img.url.trim(),
            alt: valueOrNull(img.alt ?? null),
            position: img.position ?? index,
          })),
        })
      }
    }

    return updatedAventure
  })

  return { slug: updated.slug, estPublie: updated.estPublie }
})
