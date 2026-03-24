import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import {
  buildGuideContactMessagePreview,
  sendGuideContactRequestViaWhatsapp,
} from '../../../utils/whatsapp-guide-contact'
import { normalizePhoneNumber } from '../../../utils/whatsapp-otp'

const bodySchema = z.object({
  message: z.string().trim().min(10, 'Décris un peu plus ta demande.').max(2000),
})

const slugifyName = (firstName?: string | null, lastName?: string | null, fallback?: string | number | null) => {
  const base = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (!base) return fallback ? String(fallback) : ''
  return base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tu dois être connecté·e pour contacter un moniteur.',
    })
  }

  if (session.user.role === 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cette action est réservée aux grimpeurs.',
    })
  }

  const body = bodySchema.parse(await readBody(event))
  const db = await prisma()
  const climberId = Number(session.user.id)

  if (!Number.isFinite(climberId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant grimpeur invalide.' })
  }

  const climber = await db.user.findUnique({
    where: { id: climberId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      onboarded: true,
    },
  })

  if (!climber || climber.role === 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Cette action est réservée aux grimpeurs.' })
  }

  const normalizedClimberPhone = normalizePhoneNumber(climber.phoneNumber || session.user.phoneNumber || '')
  if (!normalizedClimberPhone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ton numéro WhatsApp est introuvable. Reconnecte-toi avant de contacter un moniteur.',
    })
  }

  const slug = event.context.params?.slug
  const normalizedSlug = typeof slug === 'string' ? slug.toLowerCase() : null
  if (!normalizedSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Moniteur introuvable.' })
  }

  let guide = null
  const numericId = Number(normalizedSlug)
  if (!Number.isNaN(numericId)) {
    guide = await db.user.findUnique({
      where: { id: numericId },
      select: { id: true, role: true, firstName: true, lastName: true, phoneNumber: true, whatsappOptIn: true },
    })
  }

  if (!guide) {
    const candidates = await db.user.findMany({
      where: { role: 'GUIDE' },
      select: { id: true, role: true, firstName: true, lastName: true, phoneNumber: true, whatsappOptIn: true },
    })
    guide = candidates.find((candidate) =>
      slugifyName(candidate.firstName, candidate.lastName, candidate.id) === normalizedSlug,
    ) || null
  }

  if (!guide || guide.role !== 'GUIDE') {
    throw createError({ statusCode: 404, statusMessage: 'Moniteur introuvable.' })
  }

  const normalizedGuidePhone = normalizePhoneNumber(guide.phoneNumber || '')
  if (!normalizedGuidePhone || !guide.whatsappOptIn) {
    throw createError({
      statusCode: 409,
      statusMessage: "Ce moniteur n'est pas joignable sur WhatsApp pour le moment.",
    })
  }

  if (guide.id === climber.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tu ne peux pas t’envoyer un message à toi-même depuis cette page.',
    })
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recentRequest = await db.guideContactRequest.findFirst({
    where: {
      guideId: guide.id,
      climberId: climber.id,
      createdAt: {
        gte: fiveMinutesAgo,
      },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })

  if (recentRequest) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Tu viens déjà d’envoyer une demande. Attends quelques minutes avant de recommencer.',
    })
  }

  const climberName = [climber.firstName, climber.lastName].filter(Boolean).join(' ').trim() || 'Un grimpeur'
  const messagePreview = buildGuideContactMessagePreview(body.message)
  const templateName = process.env.WHATSAPP_GUIDE_CONTACT_TEMPLATE_NAME || 'guide_contact_request'

  const request = await db.guideContactRequest.create({
    data: {
      guideId: guide.id,
      climberId: climber.id,
      message: body.message.trim(),
      messagePreview,
      climberNameSnapshot: climberName,
      climberPhoneSnapshot: normalizedClimberPhone,
      guidePhoneSnapshot: normalizedGuidePhone,
      templateName,
      messageStatus: 'pending',
    },
  })

  const sendResult = await sendGuideContactRequestViaWhatsapp({
    phoneNumber: normalizedGuidePhone,
    guideFirstName: guide.firstName,
    climberName,
    climberPhoneNumber: normalizedClimberPhone,
    messagePreview,
  })

  if (!sendResult.ok) {
    await db.guideContactRequest.update({
      where: { id: request.id },
      data: {
        messageStatus: 'failed',
        failureReason: sendResult.message,
      },
    })

    throw createError({
      statusCode: sendResult.reason === 'not_configured' ? 503 : 502,
      statusMessage: 'Impossible d’envoyer ta demande WhatsApp pour le moment.',
    })
  }

  await db.guideContactRequest.update({
    where: { id: request.id },
    data: {
      messageId: sendResult.messageId,
      messageStatus: 'accepted',
      sentAt: new Date(),
      failureReason: null,
    },
  })

  return {
    ok: true,
    message: `Ton message a bien été envoyé à ${guide.firstName || 'ce moniteur'}.`,
  }
})
