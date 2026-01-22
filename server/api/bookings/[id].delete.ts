import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const sessionAuth = await getUserSession(event)

  if (!sessionAuth?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tu dois être connecté·e pour annuler.',
    })
  }

  if (sessionAuth.user.role && sessionAuth.user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seuls les grimpeurs peuvent annuler leurs sessions.',
    })
  }

  const idParam = event.context.params?.id
  const bookingId = Number(idParam)
  if (!bookingId || Number.isNaN(bookingId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de réservation invalide.' })
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      session: true,
    },
  })

  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Réservation introuvable.' })
  }

  if (booking.userId !== Number(sessionAuth.user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Tu ne peux annuler que tes propres réservations.' })
  }

  if (booking.statut === 'ANNULEE') {
    return { ok: true, message: 'Déjà annulée.' }
  }

  // Mettre à jour le statut
  await db.booking.update({
    where: { id: bookingId },
    data: {
      statut: 'ANNULEE',
    },
  })

  // Décrémenter les places réservées (sans descendre sous zéro)
  if (booking.session) {
    await db.aventureSession.update({
      where: { id: booking.sessionId },
      data: {
        placesReservees: {
          decrement: Math.max(1, booking.participants || 1),
        },
      },
    })
  }

  return { ok: true, message: 'Pré-inscription annulée.' }
})
