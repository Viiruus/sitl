import { normalizePhoneNumber } from '~~/shared/utils/phone-number'
import { prisma } from '../../../utils/prisma'
import {
  formatBookingStageDate,
  sendGuideStageDatePropositionViaWhatsapp,
} from '../../../utils/whatsapp-booking-subscription'
import { assertClimberOnboardingComplete } from '../../../utils/climber-onboarding'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const slug = event.context.params?.slug
  if (!slug || typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug manquant',
    })
  }

  const session = await getUserSession(event)
  const userId = Number(session?.user?.id)
  if (!userId || Number.isNaN(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tu dois être connecté·e pour proposer des dates.',
    })
  }
  if (session?.user?.role === 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Réservé aux grimpeurs.',
    })
  }

  const aventure = await db.aventure.findUnique({
    where: { slug },
    select: {
      id: true,
      titre: true,
      lieuLabel: true,
      guide: {
        select: {
          id: true,
          phoneNumber: true,
          whatsappOptIn: true,
        },
      },
    },
  })

  if (!aventure) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Aventure introuvable',
    })
  }

  const body = await readBody<{
    startDate: string
    endDate?: string
    comment?: string
  }>(event)

  if (!body?.startDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Merci de sélectionner au moins une date.',
    })
  }

  const startDate = new Date(body.startDate)
  if (Number.isNaN(+startDate)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Date de début invalide.',
    })
  }

  let endDate: Date | null = null
  if (body.endDate) {
    endDate = new Date(body.endDate)
    if (Number.isNaN(+endDate)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Date de fin invalide.',
      })
    }
  }

  const userExists = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true,
      onboarded: true,
    },
  })

  if (!userExists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Utilisateur introuvable.',
    })
  }

  await assertClimberOnboardingComplete(db, userExists)

  const suggestion = await db.aventureDateSuggestion.create({
    data: {
      aventure: { connect: { id: aventure.id } },
      user: { connect: { id: userId } },
      startDate,
      endDate: endDate ?? startDate,
      comment: body.comment?.slice(0, 500) ?? null,
    },
  })

  const normalizedGuidePhone = normalizePhoneNumber(aventure.guide?.phoneNumber || '')
  const normalizedClimberPhone = normalizePhoneNumber(userExists.phoneNumber || session.user.phoneNumber || '')

  if (aventure.guide?.whatsappOptIn && normalizedGuidePhone && normalizedClimberPhone) {
    const stageDate = formatBookingStageDate(startDate, endDate ?? startDate)

    try {
      const result = await sendGuideStageDatePropositionViaWhatsapp({
        phoneNumber: normalizedGuidePhone,
        stageTitle: aventure.titre,
        stageLocalization: aventure.lieuLabel || 'Lieu à confirmer',
        climberFirstName: userExists.firstName,
        climberLastName: userExists.lastName,
        climberPhoneNumber: normalizedClimberPhone,
        stageDate,
      })

      if (!result.ok) {
        console.error('[whatsapp-guide-stage-date-proposition] Non-blocking send failure', {
          suggestionId: suggestion.id,
          guideId: aventure.guide?.id,
          phoneNumber: normalizedGuidePhone,
          reason: result.reason,
          statusCode: result.statusCode,
          raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
        })
      }
    } catch (error) {
      console.error('[whatsapp-guide-stage-date-proposition] Non-blocking send exception', {
        suggestionId: suggestion.id,
        guideId: aventure.guide?.id,
        phoneNumber: normalizedGuidePhone,
        error,
      })
    }
  }

  return {
    suggestion,
    message: 'Merci ! Nous notons ces disponibilités.',
  }
})
