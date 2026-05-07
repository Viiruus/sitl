import { z } from 'zod'
import { prisma } from '../../../../../utils/prisma'
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
  const rawSessionId = event.context.params?.sessionId

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }
  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const sessionId = Number(rawSessionId)
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Session invalide' })
  }

  const body = bodySchema.parse(await readBody(event))
  const db = await prisma()
  const guideId = Number(session.user.id)

  const aventure = await db.aventure.findFirst({
    where: { slug, guideId },
    select: { id: true, jours: true },
  })

  if (!aventure) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  const targetSession = await db.aventureSession.findFirst({
    where: {
      id: sessionId,
      aventureId: aventure.id,
    },
    select: {
      id: true,
      placesTotales: true,
      placesReservees: true,
      statut: true,
    },
  })

  if (!targetSession) {
    throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })
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
      id: { not: targetSession.id },
      statut: {
        not: 'ANNULE',
      },
      aventure: {
        guideId,
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

  const updated = await db.aventureSession.update({
    where: { id: targetSession.id },
    data: {
      dateDebut: computedSession.dateDebut,
      dateFin: computedSession.dateFin,
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

  return {
    session: updated,
  }
})
