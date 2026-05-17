import { prisma } from './prisma'
import {
  buildPhoneLookupVariants,
  createPublicOtpToken,
  generateOtpCode,
  getOtpMaxAttempts,
  getOtpTtlMs,
  getWhatsAppOtpTemplateConfig,
  hashOtpCode,
  isWhatsAppOtpDevFallbackEnabled,
  normalizePhoneNumber,
  shouldBypassRealWhatsAppSend,
  sendOtpViaWhatsapp,
  verifyOtpCodeHash,
} from './whatsapp-otp'

const GUIDE_LOGIN_PURPOSE = 'GUIDE_LOGIN'

function logGuideOtp(event: string, payload: Record<string, unknown>) {
  console.info(`[whatsapp-guide-otp] ${event}`, payload)
}

function serializeForLog(value: unknown) {
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return '[unserializable]'
  }
}

function derivedEmailFromPhone(phone: string) {
  const cleaned = phone.replace(/[^a-zA-Z0-9]/g, '')
  return `wa-guide-${cleaned || 'user'}@whatsapp.local`
}

function normalizeFailureReason(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return 'unknown_error'
  }
}

function extractWebhookFailureReason(status: any) {
  const firstError = Array.isArray(status?.errors) ? status.errors[0] : null
  return (
    firstError?.title ||
    firstError?.message ||
    firstError?.error_data?.details ||
    normalizeFailureReason(firstError)
  )
}

async function findExistingGuideUser(normalizedPhone: string) {
  const db = await prisma()
  const phoneLookupVariants = buildPhoneLookupVariants(normalizedPhone)

  return db.user.findFirst({
    where: {
      phoneNumber: {
        in: phoneLookupVariants,
      },
    },
    include: {
      guideProfile: true,
    },
  })
}

async function findGuideUserByDerivedEmail(normalizedPhone: string) {
  const db = await prisma()
  return db.user.findUnique({
    where: {
      email: derivedEmailFromPhone(normalizedPhone),
    },
    include: {
      guideProfile: true,
    },
  })
}

export async function requestGuideWhatsappOtp(input: {
  phoneNumber: string
  source?: string | null
}) {
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber)
  logGuideOtp('request_received', {
    phoneNumber: input.phoneNumber,
    normalizedPhone,
    source: input.source || 'guide',
  })

  if (!normalizedPhone || normalizedPhone.length < 6) {
    logGuideOtp('request_rejected_invalid_phone', {
      phoneNumber: input.phoneNumber,
      normalizedPhone,
      source: input.source || 'guide',
    })
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone invalide.' })
  }

  const existingUser = await findExistingGuideUser(normalizedPhone)
  logGuideOtp('existing_user_lookup', {
    normalizedPhone,
    foundUserId: existingUser?.id || null,
    foundUserRole: existingUser?.role || null,
    foundUserEmail: existingUser?.email || null,
  })

  if (existingUser && existingUser.role !== 'GUIDE') {
    logGuideOtp('request_rejected_climber_collision', {
      normalizedPhone,
      foundUserId: existingUser.id,
      foundUserRole: existingUser.role,
      foundUserEmail: existingUser.email,
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte grimpeur. Utilise la connexion grimpeur.',
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
      purpose: GUIDE_LOGIN_PURPOSE,
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
      userId: existingUser?.role === 'GUIDE' ? existingUser.id : null,
      purpose: GUIDE_LOGIN_PURPOSE,
      status: 'PENDING',
      publicToken,
      phoneNumber: normalizedPhone,
      source: input.source || 'guide',
      codeHash: hashOtpCode(code),
      attempts: 0,
      maxAttempts: getOtpMaxAttempts(),
      templateName: templateConfig.name,
      expiresAt,
    },
  })

  logGuideOtp('challenge_created', {
    challengeId: challenge.id,
    normalizedPhone,
    source: input.source || 'guide',
    templateName: challenge.templateName,
    expiresAt: challenge.expiresAt.toISOString(),
    linkedUserId: challenge.userId || null,
  })

  if (shouldBypassRealWhatsAppSend()) {
    await db.whatsAppOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        messageStatus: 'local',
        failureReason: null,
      },
    })

    return {
      ok: true as const,
      token: publicToken,
      expiresAt,
      devCode: code,
      notice: 'Mode local: code OTP généré localement.',
    }
  }

  logGuideOtp('send_attempt', {
    challengeId: challenge.id,
    normalizedPhone,
    templateName: templateConfig.name,
    templateLanguage: templateConfig.language,
    buttonSubType: templateConfig.buttonSubType || null,
    expiresAt: expiresAt.toISOString(),
  })

  const sendResult = await sendOtpViaWhatsapp(normalizedPhone, code)
  if (!sendResult.ok) {
    const allowDevFallback = isWhatsAppOtpDevFallbackEnabled()
    logGuideOtp('send_failed', {
      challengeId: challenge.id,
      normalizedPhone,
      reason: sendResult.reason,
      statusCode: sendResult.statusCode || null,
      raw: serializeForLog(sendResult.raw),
      message: sendResult.message,
      allowDevFallback,
    })

    await db.whatsAppOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        status: allowDevFallback ? 'PENDING' : 'SEND_FAILED',
        messageStatus: 'failed',
        failureReason: sendResult.message,
      },
    })

    if (allowDevFallback) {
      return {
        ok: true as const,
        token: publicToken,
        expiresAt,
        devCode: code,
        notice: sendResult.message || 'WhatsApp non configuré, code renvoyé pour les tests.',
      }
    }

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

  logGuideOtp('send_accepted', {
    challengeId: challenge.id,
    normalizedPhone,
    messageId: sendResult.messageId,
    raw: serializeForLog(sendResult.raw),
    sentAt: now.toISOString(),
  })

  return {
    ok: true as const,
    token: publicToken,
    expiresAt,
  }
}

export async function verifyGuideWhatsappOtp(input: {
  phoneNumber: string
  token: string
  code: string
  source?: string | null
}) {
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber)
  logGuideOtp('verify_attempt_received', {
    phoneNumber: input.phoneNumber,
    normalizedPhone,
    token: input.token,
    source: input.source || 'guide',
  })

  if (!normalizedPhone || normalizedPhone.length < 6) {
    logGuideOtp('verify_rejected_invalid_phone', {
      phoneNumber: input.phoneNumber,
      normalizedPhone,
      source: input.source || 'guide',
    })
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone invalide.' })
  }

  const db = await prisma()
  const challenge = await db.whatsAppOtpChallenge.findUnique({
    where: { publicToken: input.token },
  })

  logGuideOtp('verify_challenge_lookup', {
    token: input.token,
    normalizedPhone,
    challengeId: challenge?.id || null,
    challengeStatus: challenge?.status || null,
    challengeMessageStatus: challenge?.messageStatus || null,
    challengeFailureReason: challenge?.failureReason || null,
    challengeMessageId: challenge?.messageId || null,
    challengeExpiresAt: challenge?.expiresAt?.toISOString?.() || null,
  })

  if (!challenge || challenge.purpose !== GUIDE_LOGIN_PURPOSE) {
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
    logGuideOtp('verify_invalid_code', {
      challengeId: challenge.id,
      normalizedPhone,
      nextAttempts,
      maxAttempts: challenge.maxAttempts,
      reachedMaxAttempts,
    })

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

  let user = await findExistingGuideUser(normalizedPhone)
  const isNew = !user

  logGuideOtp('verify_existing_user_lookup', {
    challengeId: challenge.id,
    normalizedPhone,
    foundUserId: user?.id || null,
    foundUserRole: user?.role || null,
    foundUserEmail: user?.email || null,
    isNew,
  })

  if (user && user.role !== 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte grimpeur. Utilise la connexion grimpeur.',
    })
  }

  if (!user) {
    user = await findGuideUserByDerivedEmail(normalizedPhone)
  }

  if (user && user.role !== 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte grimpeur. Utilise la connexion grimpeur.',
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
        acquisitionSource: input.source || challenge.source || 'guide',
        onboarded: false,
        onboardingStep: 0,
        role: 'GUIDE',
        guideProfile: {
          create: {
            bio: '',
            baseLocation: null,
            instagramUrl: null,
            profileImageUrl: null,
            isPublic: true,
          },
        },
      },
      include: { guideProfile: true },
    })
  } else if (user.phoneNumber !== normalizedPhone || !user.whatsappOptIn) {
    user = await db.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: normalizedPhone,
        whatsappOptIn: true,
      },
      include: { guideProfile: true },
    })
  } else if (!user.guideProfile) {
    await db.guideProfile.create({
      data: {
        userId: user.id,
        bio: '',
        baseLocation: null,
        instagramUrl: null,
        profileImageUrl: null,
        isPublic: true,
      },
    })
    user = await db.user.findUnique({
      where: { id: user.id },
      include: { guideProfile: true },
    })
  }

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Impossible de finaliser l’authentification.' })
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

  logGuideOtp('verify_success', {
    challengeId: challenge.id,
    normalizedPhone,
    userId: user.id,
    requiresOnboarding: isNew,
    consumedAt: now.toISOString(),
  })

  return { ok: true as const, requiresOnboarding: isNew, user }
}

export async function consumeGuideWhatsappWebhookPayload(payload: any) {
  const db = await prisma()
  const statuses = (payload?.entry || [])
    .flatMap((entry: any) => entry?.changes || [])
    .flatMap((change: any) => change?.value?.statuses || [])

  logGuideOtp('webhook_status_batch_received', {
    statusesCount: statuses.length,
    payloadObject: payload?.object || null,
  })

  for (const status of statuses) {
    const messageId = typeof status?.id === 'string' ? status.id : null
    if (!messageId) continue

    const challenge = await db.whatsAppOtpChallenge.findUnique({
      where: { messageId },
      select: { id: true, status: true },
    })
    if (!challenge) {
      logGuideOtp('webhook_status_unmatched', {
        messageId,
        status: status?.status || null,
        raw: serializeForLog(status),
      })
      continue
    }

    const messageStatus = typeof status?.status === 'string' ? status.status : null
    const failureReason = messageStatus === 'failed'
      ? extractWebhookFailureReason(status)
      : null
    const data: Record<string, any> = {
      lastWebhookPayload: status,
    }

    if (messageStatus) {
      data.messageStatus = messageStatus
    }
    if (failureReason) {
      data.failureReason = failureReason
    }
    if (messageStatus === 'failed' && challenge.status === 'PENDING') {
      data.status = 'SEND_FAILED'
    }

    await db.whatsAppOtpChallenge.update({
      where: { id: challenge.id },
      data,
    })

    logGuideOtp('webhook_status_applied', {
      challengeId: challenge.id,
      messageId,
      previousChallengeStatus: challenge.status,
      messageStatus,
      failureReason,
      raw: serializeForLog(status),
      nextChallengeStatus: data.status || challenge.status,
    })
  }
}
