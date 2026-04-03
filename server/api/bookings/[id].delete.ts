import { prisma } from '../../utils/prisma'
import {
  formatBookingStageDate,
  sendGuideClimberStageCancelationViaWhatsapp,
} from '../../utils/whatsapp-booking-subscription'
import { normalizePhoneNumber } from '../../utils/whatsapp-otp'

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
      session: {
        include: {
          aventure: {
            include: {
              guide: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  whatsappOptIn: true,
                },
              },
            },
          },
        },
      },
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

  const climber = await db.user.findUnique({
    where: { id: booking.userId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
    },
  })

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

  const guide = booking.session?.aventure?.guide
  const normalizedGuidePhone = normalizePhoneNumber(guide?.phoneNumber || '')
  const normalizedClimberPhone = normalizePhoneNumber(climber?.phoneNumber || sessionAuth.user.phoneNumber || '')

  if (guide?.whatsappOptIn && normalizedGuidePhone && normalizedClimberPhone) {
    const stageTitle = booking.session.aventure.titre
    const stageLocalization = booking.session.aventure.lieuLabel || 'Lieu à confirmer'
    const stageDate = formatBookingStageDate(booking.session.dateDebut, booking.session.dateFin)

    try {
      const result = await sendGuideClimberStageCancelationViaWhatsapp({
        phoneNumber: normalizedGuidePhone,
        stageTitle,
        stageLocalization,
        stageDate,
        climberFirstName: climber?.firstName,
        climberLastName: climber?.lastName,
        climberPhoneNumber: normalizedClimberPhone,
      })

      if (!result.ok) {
        console.error('[whatsapp-guide-climber-stage-cancelation] Non-blocking send failure', {
          bookingId,
          guideId: guide.id,
          phoneNumber: normalizedGuidePhone,
          reason: result.reason,
          statusCode: result.statusCode,
          raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
        })
      }
    } catch (error) {
      console.error('[whatsapp-guide-climber-stage-cancelation] Non-blocking send exception', {
        bookingId,
        guideId: guide.id,
        phoneNumber: normalizedGuidePhone,
        error,
      })
    }
  }

  return { ok: true, message: 'Pré-inscription annulée.' }
})
