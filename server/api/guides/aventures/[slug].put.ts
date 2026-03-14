import { z } from 'zod'
import { prisma } from '../../../utils/prisma'

const stringListSchema = z.array(z.string().trim().min(1)).optional()
const imageVariantSchema = z.object({
  url: z.string().trim().startsWith('/uploads/'),
  width: z.number().int().min(1),
  size: z.number().int().min(0).optional(),
})

const imageUrlSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return false
    if (value.startsWith('/uploads/') || value.startsWith('/api/moniteurs/uploads/')) return true
    try {
      const url = new URL(value)
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }, { message: 'URL d’image invalide' })

const coverImageSchema = imageUrlSchema.or(z.literal(null)).optional()
const coverImageVariantsSchema = z.array(imageVariantSchema).max(24).optional()

const galleryImageSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().trim().optional(),
  position: z.number().int().min(0).optional(),
  variants: z.array(imageVariantSchema).max(24).optional(),
})

const programmeJourSchema = z.object({
  ordre: z.number().int().min(1).optional(),
  titre: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  lieuLabel: z.string().trim().min(1).optional(),
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
    coverImageVariants: coverImageVariantsSchema,
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
    programmeJours: z.array(programmeJourSchema).optional(),
  })

const listOrNull = (value?: string[] | null) => {
  if (!value || value.length === 0) return null
  return value
}

const valueOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const imageUrlOrNull = (value?: string | null) => {
  const trimmed = valueOrNull(value)
  if (!trimmed) return null
  return trimmed
}

const variantsOrNull = (value?: { url: string; width: number; size?: number }[] | null) => {
  if (!value || !value.length) return null
  const normalized = value
    .map((entry) => ({
      url: entry.url.trim(),
      width: entry.width,
      ...(entry.size != null ? { size: entry.size } : {}),
    }))
    .filter((entry) => entry.url && entry.width > 0)
  return normalized.length ? normalized : null
}

const jsonListToStrings = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.map((entry) => String(entry).trim()).filter(Boolean)
}

const assertPublishedAdventureFields = (data: {
  estPublie: boolean
  sousTitre?: string | null
  niveauMinimum?: string | null
  descriptionCourte?: string | null
  coverImageUrl?: string | null
  equipementRequis?: string[]
  inclus?: string | null
  nonInclus?: string | null
}) => {
  if (!data.estPublie) return

  const issues: { path: string[]; message: string }[] = []
  const isFilled = (value?: string | null) => Boolean(value && value.trim())

  if (!data.sousTitre || data.sousTitre.trim().length < 3) {
    issues.push({ path: ['sousTitre'], message: 'Ajoute un sous-titre (3 caractères min).' })
  }
  if (!isFilled(data.niveauMinimum)) {
    issues.push({ path: ['niveauMinimum'], message: 'Précise le niveau minimum.' })
  }
  if (!data.descriptionCourte || data.descriptionCourte.trim().length < 10) {
    issues.push({ path: ['descriptionCourte'], message: 'Ajoute une description courte (10 caractères min).' })
  }
  if (!isFilled(data.coverImageUrl)) {
    issues.push({ path: ['coverImageUrl'], message: 'Ajoute une image de couverture.' })
  }
  if (!data.equipementRequis || data.equipementRequis.length === 0) {
    issues.push({ path: ['equipementRequis'], message: 'Ajoute au moins un élément pour l’équipement requis.' })
  }
  if (!isFilled(data.inclus)) {
    issues.push({ path: ['inclus'], message: 'Décris ce qui est inclus.' })
  }
  if (!isFilled(data.nonInclus)) {
    issues.push({ path: ['nonInclus'], message: 'Décris ce qui n’est pas inclus.' })
  }

  if (issues.length) {
    throw createError({
      statusCode: 422,
      statusMessage: issues[0].message,
      data: {
        issues,
      },
    })
  }
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
    select: {
      id: true,
      estPublie: true,
      sousTitre: true,
      niveauMinimum: true,
      descriptionCourte: true,
      coverImageUrl: true,
      equipementRequis: true,
      inclus: true,
      nonInclus: true,
    },
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  const nextPublishedState = body.estPublie ?? existing.estPublie

  assertPublishedAdventureFields({
    estPublie: nextPublishedState,
    sousTitre: body.sousTitre ?? existing.sousTitre,
    niveauMinimum: body.niveauMinimum ?? existing.niveauMinimum,
    descriptionCourte: body.descriptionCourte ?? existing.descriptionCourte,
    coverImageUrl: body.coverImageUrl === undefined ? existing.coverImageUrl : body.coverImageUrl,
    equipementRequis: body.equipementRequis ?? jsonListToStrings(existing.equipementRequis),
    inclus: body.inclus ?? existing.inclus,
    nonInclus: body.nonInclus ?? existing.nonInclus,
  })

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
        ...(body.coverImageUrl !== undefined
          ? {
              coverImageUrl: imageUrlOrNull(body.coverImageUrl ?? null),
              coverImageVariants: variantsOrNull(body.coverImageVariants ?? null),
            }
          : {}),
        equipementRequis: listOrNull(body.equipementRequis ?? null),
        equipementFourni: listOrNull(body.equipementFourni ?? null),
        hebergementDetails: valueOrNull(body.hebergementDetails ?? null),
        inclus: valueOrNull(body.inclus ?? null),
        nonInclus: valueOrNull(body.nonInclus ?? null),
        objectifs: valueOrNull(body.objectifs ?? null),
        prerequis: listOrNull(body.prerequis ?? null),
        repasLabel: valueOrNull(body.repasLabel ?? null),
        estPublie: nextPublishedState,
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
        const imageRows = body.images
          .map((img, index) => {
            const safeUrl = imageUrlOrNull(img.url)
            if (!safeUrl) return null
            return {
              aventureId: existing.id,
              url: safeUrl,
              alt: valueOrNull(img.alt ?? null),
              position: img.position ?? index,
              variants: variantsOrNull(img.variants ?? null),
            }
          })
          .filter((row): row is {
            aventureId: number
            url: string
            alt: string | null
            position: number
            variants: { url: string; width: number; size?: number }[] | null
          } => Boolean(row))

        if (imageRows.length) {
          await tx.aventureImage.createMany({
            data: imageRows,
          })
        }
      }
    }

    if (body.programmeJours) {
      await tx.aventureJour.deleteMany({ where: { aventureId: existing.id } })
      if (body.programmeJours.length) {
        await tx.aventureJour.createMany({
          data: body.programmeJours.map((jour, index) => ({
            aventureId: existing.id,
            ordre: jour.ordre ?? index + 1,
            titre: jour.titre.trim(),
            description: valueOrNull(jour.description ?? null),
            lieuLabel: valueOrNull(jour.lieuLabel ?? null),
          })),
        })
      }
    }

    return updatedAventure
  })

  return { slug: updated.slug, estPublie: updated.estPublie }
})
