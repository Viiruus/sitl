import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'
import { notifyStageNotificationSubscribers } from '../../../../utils/stage-notifications'
import {
  computeSessionEndFromDuration,
  formatDurationDays,
  formatSessionRangeLabel,
  type SessionHalfDay,
} from '~~/shared/utils/aventure-schedule'

const bodySchema = z
  .object({
    dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    demiJourneeDebut: z.enum(['AM', 'PM']).default('AM'),
  })

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

  const aventure = await db.aventure.findFirst({
    where: { slug, guideId: Number(session.user.id) },
    select: { id: true, jours: true, placesMax: true, estPublie: true },
  })

  if (!aventure) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  const computedSession = computeSessionEndFromDuration(body.dateDebut, body.demiJourneeDebut as SessionHalfDay, aventure.jours)
  if (!computedSession?.dateDebut || !computedSession?.dateFin) {
    throw createError({
      statusCode: 422,
      statusMessage: `Cette session doit couvrir exactement ${formatDurationDays(aventure.jours)}.`,
    })
  }

  const conflictingSession = await db.aventureSession.findFirst({
    where: {
      statut: {
        not: 'ANNULE',
      },
      aventure: {
        guideId: Number(session.user.id),
      },
      dateDebut: {
        lte: computedSession.dateFin,
      },
      dateFin: {
        gte: computedSession.dateDebut,
      },
    },
    select: {
      id: true,
      dateDebut: true,
      dateFin: true,
      aventure: {
        select: {
          titre: true,
          slug: true,
        },
      },
    },
  })

  if (conflictingSession) {
    throw createError({
      statusCode: 409,
      statusMessage: `Une session est déjà planifiée sur cette période pour "${conflictingSession.aventure.titre}" (${formatSessionRangeLabel(conflictingSession.dateDebut, conflictingSession.dateFin)}).`,
    })
  }

  const created = await db.aventureSession.create({
    data: {
      aventureId: aventure.id,
      dateDebut: computedSession.dateDebut,
      dateFin: computedSession.dateFin,
      statut: 'OUVERT',
      placesTotales: aventure.placesMax,
    },
    select: {
      id: true,
      dateDebut: true,
      dateFin: true,
      statut: true,
      placesTotales: true,
      placesReservees: true,
    },
  })

  if (aventure.estPublie) {
    const runtimeConfig = useRuntimeConfig(event)
    await notifyStageNotificationSubscribers({
      db,
      aventureId: aventure.id,
      sessionId: created.id,
      publicUrl: runtimeConfig.public.publicUrl,
    }).catch((error) => {
      console.error('[stage-notifications] Session notification failure', {
        aventureId: aventure.id,
        sessionId: created.id,
        error,
      })
    })
  }

  return { session: created }
})
