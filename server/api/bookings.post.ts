// server/api/bookings.post.ts
import { prisma } from '../utils/prisma'
import {
  formatBookingStageDate,
  sendClimberSubscriptionOkViaWhatsapp,
  sendGuideNewSubscriptionViaWhatsapp,
} from '../utils/whatsapp-booking-subscription'
import { normalizePhoneNumber } from '../utils/whatsapp-otp'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const sessionAuth = await getUserSession(event)

  if (!sessionAuth?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tu dois être connecté·e pour réserver.',
    })
  }

  if (sessionAuth.user.role && sessionAuth.user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: "Seuls les grimpeurs peuvent s'inscrire à une date.",
    })
  }

  const userId = Number(sessionAuth.user.id)
  if (Number.isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Identifiant utilisateur invalide.',
    })
  }

  const body = await readBody<{ sessionId?: number | string }>(event)
  const sessionId = Number(body.sessionId)

  if (!sessionId || Number.isNaN(sessionId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'SessionId manquant ou invalide.',
    })
  }

  const climber = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      whatsappOptIn: true,
    },
  })

  if (!climber || climber.role === 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: "Seuls les grimpeurs peuvent s'inscrire à une date.",
    })
  }

  // Vérifier que la session existe
  const dbSession = await db.aventureSession.findUnique({
    where: { id: sessionId },
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
  })

  if (!dbSession) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session introuvable.',
    })
  }

  if (dbSession.statut !== 'OUVERT') {
    throw createError({
      statusCode: 400,
      statusMessage: "Cette date n'est pas ouverte aux réservations.",
    })
  }

  // Vérifier si l'utilisateur est déjà inscrit
  const existing = await db.booking.findFirst({
    where: {
      userId,
      sessionId,
      statut: {
        not: 'ANNULEE',
      },
    },
  })

  if (existing) {
    return {
      booking: existing,
      already: true,
      message: 'Tu es déjà inscrit·e sur cette date.',
    }
  }

  // Vérifier les places restantes
  const placesRestantes =
    dbSession.placesTotales - dbSession.placesReservees

  if (placesRestantes <= 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Il n'y a plus de places disponibles pour cette date.",
    })
  }

  // Créer la réservation
  const montant =
    dbSession.prixSpecifique ?? dbSession.aventure.prixParPersonne

  const booking = await db.booking.create({
    data: {
      sessionId,
      userId,
      participants: 1,
      montant,
      statut: 'EN_ATTENTE',
    },
  })

  // Incrémenter le nombre de places réservées
  await db.aventureSession.update({
    where: { id: sessionId },
    data: {
      placesReservees: {
        increment: 1,
      },
    },
  })

  const runtimeConfig = useRuntimeConfig(event)
  const stageTitle = dbSession.aventure.titre
  const stageLocalization = dbSession.aventure.lieuLabel || 'Lieu à confirmer'
  const stageDate = formatBookingStageDate(dbSession.dateDebut, dbSession.dateFin)
  const stageUrl = (() => {
    const baseUrl = runtimeConfig.public.publicUrl || 'https://brigadedukiff.com'
    try {
      return new URL(`/stages-escalade/${dbSession.aventure.slug}`, baseUrl).toString()
    } catch {
      return `/stages-escalade/${dbSession.aventure.slug}`
    }
  })()

  const normalizedClimberPhone = normalizePhoneNumber(climber.phoneNumber || sessionAuth.user.phoneNumber || '')
  const normalizedGuidePhone = normalizePhoneNumber(dbSession.aventure.guide?.phoneNumber || '')

  const notificationJobs: Promise<void>[] = []

  if (normalizedGuidePhone && normalizedClimberPhone && dbSession.aventure.guide?.whatsappOptIn) {
    notificationJobs.push(
      sendGuideNewSubscriptionViaWhatsapp({
        phoneNumber: normalizedGuidePhone,
        stageTitle,
        stageLocalization,
        stageDate,
        climberFirstName: climber.firstName,
        climberLastName: climber.lastName,
        climberPhoneNumber: normalizedClimberPhone,
      }).then((result) => {
        if (!result.ok) {
          console.error('[whatsapp-guide-new-subscription] Non-blocking send failure', {
            bookingId: booking.id,
            guideId: dbSession.aventure.guide?.id,
            phoneNumber: normalizedGuidePhone,
            reason: result.reason,
            statusCode: result.statusCode,
            raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
          })
        }
      }).catch((error) => {
        console.error('[whatsapp-guide-new-subscription] Non-blocking send exception', {
          bookingId: booking.id,
          guideId: dbSession.aventure.guide?.id,
          phoneNumber: normalizedGuidePhone,
          error,
        })
      }),
    )
  }

  if (normalizedClimberPhone && climber.whatsappOptIn) {
    notificationJobs.push(
      sendClimberSubscriptionOkViaWhatsapp({
        phoneNumber: normalizedClimberPhone,
        stageTitle,
        stageLocalization,
        stageDate,
        stageUrl,
      }).then((result) => {
        if (!result.ok) {
          console.error('[whatsapp-climber-subscription-ok] Non-blocking send failure', {
            bookingId: booking.id,
            climberId: climber.id,
            phoneNumber: normalizedClimberPhone,
            reason: result.reason,
            statusCode: result.statusCode,
            raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
          })
        }
      }).catch((error) => {
        console.error('[whatsapp-climber-subscription-ok] Non-blocking send exception', {
          bookingId: booking.id,
          climberId: climber.id,
          phoneNumber: normalizedClimberPhone,
          error,
        })
      }),
    )
  }

  await Promise.allSettled(notificationJobs)

  return {
    booking,
    already: false,
    message: 'Réservation enregistrée 🎉',
  }
})
