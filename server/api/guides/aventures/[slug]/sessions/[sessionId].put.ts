import { z } from 'zod'
import { prisma } from '../../../../../utils/prisma'

const dateSchema = z.preprocess(
  (value) => {
    if (value instanceof Date) return value
    if (typeof value === 'string' && value) return new Date(value)
    return value
  },
  z.date({ required_error: 'Date requise' }),
)

const bodySchema = z
  .object({
    dateDebut: dateSchema,
    dateFin: dateSchema.optional().nullable(),
  })
  .refine((data) => {
    if (!data.dateFin) return true
    return data.dateFin >= data.dateDebut
  }, { message: 'La date de fin doit être après la date de début', path: ['dateFin'] })

const MS_PER_DAY = 24 * 60 * 60 * 1000

const toUtcDayTimestamp = (value: Date) => Date.UTC(
  value.getUTCFullYear(),
  value.getUTCMonth(),
  value.getUTCDate(),
)

const getInclusiveDaySpan = (start: Date, end: Date) => {
  return Math.floor((toUtcDayTimestamp(end) - toUtcDayTimestamp(start)) / MS_PER_DAY) + 1
}

const formatSessionDate = (value: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value)
}

const formatSessionPeriod = (start: Date, end: Date) => {
  const startLabel = formatSessionDate(start)
  const endLabel = formatSessionDate(end)
  return startLabel === endLabel ? startLabel : `${startLabel} → ${endLabel}`
}

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

  const sessionEndDate = body.dateFin ?? body.dateDebut
  const inclusiveDaySpan = getInclusiveDaySpan(body.dateDebut, sessionEndDate)
  if (inclusiveDaySpan !== aventure.jours) {
    throw createError({
      statusCode: 422,
      statusMessage: `Cette session doit couvrir exactement ${aventure.jours} jour${aventure.jours > 1 ? 's' : ''}.`,
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
        lte: sessionEndDate,
      },
      dateFin: {
        gte: body.dateDebut,
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
      statusMessage: `Une session est déjà planifiée sur cette période pour "${conflictingSession.aventure.titre}" (${formatSessionPeriod(conflictingSession.dateDebut, conflictingSession.dateFin)}).`,
    })
  }

  const updated = await db.aventureSession.update({
    where: { id: targetSession.id },
    data: {
      dateDebut: body.dateDebut,
      dateFin: sessionEndDate,
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
