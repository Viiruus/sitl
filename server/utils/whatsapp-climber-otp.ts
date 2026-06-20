import { prisma } from './prisma'
import { normalizeWhatsAppPhoneNumber } from '~~/shared/utils/phone-number'
import {
  buildPhoneLookupVariants,
  createPublicOtpToken,
  generateOtpCode,
  getOtpMaxAttempts,
  getOtpTtlMs,
  getWhatsAppOtpTemplateConfig,
  hashOtpCode,
  sendOtpViaWhatsapp,
  verifyOtpCodeHash,
} from './whatsapp-otp'

const CLIMBER_LOGIN_PURPOSE = 'CLIMBER_LOGIN'

function derivedEmailFromPhone(phone: string) {
  const cleaned = phone.replace(/[^a-zA-Z0-9]/g, '')
  return `wa-${cleaned || 'user'}@whatsapp.local`
}

async function findExistingClimberUser(normalizedPhone: string) {
  const db = await prisma()
  const phoneLookupVariants = buildPhoneLookupVariants(normalizedPhone)

  return db.user.findFirst({
    where: {
      phoneNumber: {
        in: phoneLookupVariants,
      },
    },
  })
}

async function findClimberUserByDerivedEmail(normalizedPhone: string) {
  const db = await prisma()
  return db.user.findUnique({
    where: {
      email: derivedEmailFromPhone(normalizedPhone),
    },
  })
}

export async function requestClimberWhatsappOtp(input: {
  phoneNumber: string
  source?: string | null
}) {
  const normalizedPhone = normalizeWhatsAppPhoneNumber(input.phoneNumber)
  if (!normalizedPhone) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone invalide.' })
  }

  const existingUser = await findExistingClimberUser(normalizedPhone)
  if (existingUser && existingUser.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte moniteur. Utilise la connexion guide.',
    })
  }

  const db = await prisma()
  const now = new Date()
  const code = generateOtpCode()
  const publicToken = createPublicOtpToken()
  const expiresAt = new Date(now.getTime() + getOtpTtlMs())
  const templateConfig = getWhatsAppOtpTemplateConfig()

  await db.whatsAppOtpChallenge.updateMany({
    where: {
      purpose: CLIMBER_LOGIN_PURPOSE,
      phoneNumber: normalizedPhone,
      status: 'PENDING',
    },
    data: {
      status: 'INVALIDATED',
      invalidatedAt: now,
    },
  })

  const challenge = await db.whatsAppOtpChallenge.create({
    data: {
      userId: existingUser?.role === 'CLIMBER' ? existingUser.id : null,
      purpose: CLIMBER_LOGIN_PURPOSE,
      status: 'PENDING',
      publicToken,
      phoneNumber: normalizedPhone,
      source: input.source || 'direct',
      codeHash: hashOtpCode(code),
      attempts: 0,
      maxAttempts: getOtpMaxAttempts(),
      templateName: templateConfig.name,
      expiresAt,
    },
  })

  const sendResult = await sendOtpViaWhatsapp(normalizedPhone, code)
  if (!sendResult.ok) {
    await db.whatsAppOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        status: 'SEND_FAILED',
        messageStatus: 'failed',
        failureReason: sendResult.message,
      },
    })

    throw createError({
      statusCode: sendResult.reason === 'not_configured' ? 500 : 502,
      statusMessage:
        sendResult.reason === 'not_configured'
          ? 'WhatsApp non configuré côté serveur.'
          : 'Envoi du code WhatsApp impossible.',
    })
  }

  await db.whatsAppOtpChallenge.update({
    where: { id: challenge.id },
    data: {
      messageId: sendResult.messageId,
      messageStatus: 'accepted',
      sentAt: now,
      failureReason: null,
    },
  })

  return {
    ok: true as const,
    token: publicToken,
    expiresAt,
  }
}

export async function verifyClimberWhatsappOtp(input: {
  phoneNumber: string
  token: string
  code: string
  source?: string | null
}) {
  const normalizedPhone = normalizeWhatsAppPhoneNumber(input.phoneNumber)
  if (!normalizedPhone) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone invalide.' })
  }

  const db = await prisma()
  const challenge = await db.whatsAppOtpChallenge.findUnique({
    where: { publicToken: input.token },
  })

  if (!challenge || challenge.purpose !== CLIMBER_LOGIN_PURPOSE) {
    throw createError({ statusCode: 400, statusMessage: 'Jeton invalide. Renvoie un nouveau code.' })
  }

  if (challenge.phoneNumber !== normalizedPhone) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro différent de la demande initiale.' })
  }

  const now = new Date()
  if (challenge.status === 'CONSUMED') {
    throw createError({ statusCode: 400, statusMessage: 'Code déjà utilisé. Renvoie un nouveau code.' })
  }
  if (challenge.status === 'MAX_ATTEMPTS') {
    throw createError({ statusCode: 400, statusMessage: 'Trop de tentatives. Renvoie un nouveau code.' })
  }
  if (challenge.status === 'EXPIRED') {
    throw createError({ statusCode: 400, statusMessage: 'Le code a expiré, renvoie un nouveau code.' })
  }
  if (challenge.status === 'INVALIDATED' || challenge.status === 'SEND_FAILED') {
    throw createError({ statusCode: 400, statusMessage: 'Demande invalide. Renvoie un nouveau code.' })
  }
  if (challenge.expiresAt.getTime() <= now.getTime()) {
    await db.whatsAppOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        status: 'EXPIRED',
        failureReason: 'expired',
      },
    })
    throw createError({ statusCode: 400, statusMessage: 'Le code a expiré, renvoie un nouveau code.' })
  }

  const nextAttempts = challenge.attempts + 1
  if (!verifyOtpCodeHash(challenge.codeHash, input.code.trim())) {
    const reachedMaxAttempts = nextAttempts >= challenge.maxAttempts
    await db.whatsAppOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: nextAttempts,
        lastAttemptAt: now,
        status: reachedMaxAttempts ? 'MAX_ATTEMPTS' : 'PENDING',
        failureReason: reachedMaxAttempts ? 'max_attempts' : 'invalid_code',
      },
    })
    throw createError({
      statusCode: 400,
      statusMessage: reachedMaxAttempts
        ? 'Trop de tentatives. Renvoie un nouveau code.'
        : 'Code incorrect.',
    })
  }

  let user = await findExistingClimberUser(normalizedPhone)
  if (user && user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte moniteur. Utilise la connexion guide.',
    })
  }

  if (!user) {
    user = await findClimberUserByDerivedEmail(normalizedPhone)
  }

  if (user && user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte moniteur. Utilise la connexion guide.',
    })
  }

  if (!user) {
    const email = derivedEmailFromPhone(normalizedPhone)
    user = await db.user.create({
      data: {
        email,
        passwordHash: null,
        phoneNumber: normalizedPhone,
        whatsappOptIn: true,
        acquisitionSource: input.source || challenge.source || null,
        onboarded: false,
        onboardingStep: 0,
        role: 'CLIMBER',
      },
    })
  } else if (user.phoneNumber !== normalizedPhone || !user.whatsappOptIn) {
    user = await db.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: normalizedPhone,
        whatsappOptIn: true,
      },
    })
  }

  await db.whatsAppOtpChallenge.update({
    where: { id: challenge.id },
    data: {
      userId: user.id,
      attempts: nextAttempts,
      lastAttemptAt: now,
      status: 'CONSUMED',
      consumedAt: now,
      failureReason: null,
    },
  })

  return { ok: true as const, user }
}
