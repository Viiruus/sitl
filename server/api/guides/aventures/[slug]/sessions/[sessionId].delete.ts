import { prisma } from '../../../../../utils/prisma'

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

  const db = await prisma()
  const guideId = Number(session.user.id)

  const aventure = await db.aventure.findFirst({
    where: { slug, guideId },
    select: { id: true, estPublie: true },
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
      dateDebut: true,
      dateFin: true,
    },
  })

  if (!targetSession) {
    throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })
  }

  const bookingsCount = await db.booking.count({
    where: { sessionId: targetSession.id },
  })

  if (bookingsCount > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Impossible de supprimer une session qui contient déjà des réservations.',
    })
  }

  const result = await db.$transaction(async (tx) => {
    await tx.aventureSession.delete({
      where: { id: targetSession.id },
    })

    const remainingSessionsCount = await tx.aventureSession.count({
      where: { aventureId: aventure.id },
    })

    let unpublishedAventure = false
    if (remainingSessionsCount === 0 && aventure.estPublie) {
      await tx.aventure.update({
        where: { id: aventure.id },
        data: { estPublie: false },
      })
      unpublishedAventure = true
    }

    return {
      remainingSessionsCount,
      unpublishedAventure,
    }
  })

  return {
    deleted: true,
    sessionId: targetSession.id,
    ...result,
  }
})
