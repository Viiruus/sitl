import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'
import { notifyStageNotificationSubscribers } from '../../../../utils/stage-notifications'

const bodySchema = z.object({
  estPublie: z.boolean(),
})

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
      data: { issues },
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
    where: {
      slug,
      guideId: Number(session.user.id),
    },
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
      sessions: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  if (body.estPublie) {
    assertPublishedAdventureFields({
      estPublie: true,
      sousTitre: existing.sousTitre,
      niveauMinimum: existing.niveauMinimum,
      descriptionCourte: existing.descriptionCourte,
      coverImageUrl: existing.coverImageUrl,
      equipementRequis: jsonListToStrings(existing.equipementRequis),
      inclus: existing.inclus,
      nonInclus: existing.nonInclus,
    })

    if (existing.sessions.length === 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Ajoute au moins une session avant de publier ce stage.',
      })
    }
  }

  await db.aventure.update({
    where: { id: existing.id },
    data: {
      estPublie: body.estPublie,
    },
  })

  if (body.estPublie && !existing.estPublie) {
    const runtimeConfig = useRuntimeConfig(event)
    await notifyStageNotificationSubscribers({
      db,
      aventureId: existing.id,
      publicUrl: runtimeConfig.public.publicUrl,
    }).catch((error) => {
      console.error('[stage-notifications] Publish notification failure', {
        aventureId: existing.id,
        error,
      })
    })
  }

  return { slug, estPublie: body.estPublie }
})
