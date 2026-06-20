import crypto from 'node:crypto'
import {
  normalizePhoneNumber,
  normalizeWhatsAppPhoneNumber,
} from '~~/shared/utils/phone-number'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const OTP_MAX_ATTEMPTS = 5

type WhatsAppOtpSendResult =
  | { ok: true; messageId: string | null; raw: any }
  | {
      ok: false
      reason: 'invalid_phone' | 'not_configured' | 'send_failed'
      message: string
      statusCode?: number
      raw?: any
    }

type WhatsAppTemplateSendInput = {
  phone: string
  templateName: string
  language?: string | null
  components?: any[]
  logLabel?: string
}

function secret() {
  return (
    process.env.WHATSAPP_AUTH_SECRET ||
    process.env.NUXT_SECRET ||
    process.env.NITRO_PRESET ||
    process.env.NITRO_SECRET ||
    'dev-whatsapp-secret'
  )
}

export function buildPhoneLookupVariants(raw: string): string[] {
  const canonical = normalizePhoneNumber(raw)
  if (!canonical) return []

  const variants = new Set<string>([canonical])
  const digits = canonical.replace(/^\+/, '')

  variants.add(digits)

  if (digits.startsWith('33') && digits.length === 11) {
    variants.add(`0${digits.slice(2)}`)
    variants.add(digits.slice(2))
  }

  return [...variants].filter(Boolean)
}

type OtpPayload = {
  phone: string
  code: string
  exp: number
  source?: string | null
}

function signPayload(payload: OtpPayload) {
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret()).update(base).digest('base64url')
  return `${base}.${sig}`
}

function verifySignature(token: string) {
  const [base, sig] = token.split('.')
  if (!base || !sig) return null
  const expected = crypto.createHmac('sha256', secret()).update(base).digest('base64url')
  if (expected !== sig) return null
  try {
    const payload = JSON.parse(Buffer.from(base, 'base64url').toString()) as OtpPayload
    return payload
  } catch {
    return null
  }
}

export function generateOtpToken(phone: string, source?: string | null) {
  const code = crypto.randomInt(100000, 999999).toString()
  const payload: OtpPayload = {
    phone,
    code,
    exp: Date.now() + OTP_TTL_MS,
    source: source ?? null,
  }
  const token = signPayload(payload)
  return { code, token, expiresAt: payload.exp }
}

export function verifyOtpToken(token: string, code: string) {
  const payload = verifySignature(token)
  if (!payload) {
    return { ok: false as const, reason: 'invalid_token' as const }
  }
  if (Date.now() > payload.exp) {
    return { ok: false as const, reason: 'expired' as const }
  }
  if (payload.code !== code) {
    return { ok: false as const, reason: 'invalid_code' as const }
  }
  return { ok: true as const, phone: payload.phone, source: payload.source ?? null }
}

export function getOtpTtlMs() {
  return OTP_TTL_MS
}

export function getOtpMaxAttempts() {
  return OTP_MAX_ATTEMPTS
}

export function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString()
}

export function createPublicOtpToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function hashOtpCode(code: string) {
  return crypto.createHmac('sha256', secret()).update(code).digest('hex')
}

export function verifyOtpCodeHash(codeHash: string, code: string) {
  const expected = Buffer.from(codeHash, 'hex')
  const actual = Buffer.from(hashOtpCode(code), 'hex')
  if (expected.length !== actual.length) return false
  return crypto.timingSafeEqual(expected, actual)
}

export function isWhatsAppOtpPersistentModeEnabled() {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'production'
  )
}

export function shouldBypassRealWhatsAppSend() {
  return !isWhatsAppOtpPersistentModeEnabled()
}

export function isWhatsAppOtpDevFallbackEnabled() {
  if (isWhatsAppOtpPersistentModeEnabled()) return false

  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.WHATSAPP_DEV_CODE === 'true' ||
    process.env.WHATSAPP_GUIDE_DEV_CODE === 'true'
  )
}

export function getWhatsAppOtpTemplateConfig() {
  return {
    name: process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'otp_code',
    language: process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr',
    buttonSubType: process.env.WHATSAPP_OTP_TEMPLATE_BUTTON_SUB_TYPE || '',
  }
}

function buildAuthenticationTemplatePayload(phone: string, code: string, buttonSubType?: string) {
  const template = getWhatsAppOtpTemplateConfig()
  const components: any[] = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: code,
        },
      ],
    },
  ]

  const activeButtonSubType = buttonSubType ?? template.buttonSubType
  if (activeButtonSubType) {
    const normalizedButtonSubType =
      activeButtonSubType.toLowerCase() === 'copy_code' ? 'url' : activeButtonSubType

    components.push({
      type: 'button',
      sub_type: normalizedButtonSubType,
      index: 0,
      parameters: [
        {
          type: 'text',
          text: code,
        },
      ],
    })
  }

  return {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: template.name,
      language: {
        code: template.language,
      },
      components,
    },
  }
}

async function sendTemplateRequest(input: WhatsAppTemplateSendInput): Promise<WhatsAppOtpSendResult> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const tokenFingerprint = token ? `${token.slice(0, 4)}...${token.slice(-4)} (len:${token.length})` : 'missing'
  const languageCode = input.language || getWhatsAppOtpTemplateConfig().language
  const logLabel = input.logLabel || 'whatsapp-template'
  const phone = normalizeWhatsAppPhoneNumber(input.phone)

  if (!phone) {
    console.warn(`[${logLabel}] Invalid phone number, Meta send skipped`, {
      vercelEnv: process.env.VERCEL_ENV || 'local',
      templateName: input.templateName,
      templateLanguage: languageCode,
      rawPhoneLength: input.phone?.length || 0,
    })

    return {
      ok: false,
      reason: 'invalid_phone' as const,
      message: 'Numéro de téléphone invalide.',
      statusCode: 400,
    }
  }

  if (!token || !phoneId) {
    return {
      ok: false,
      reason: 'not_configured' as const,
      message: 'WHATSAPP_CLOUD_TOKEN et WHATSAPP_PHONE_NUMBER_ID manquants.',
    }
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: input.templateName,
      language: {
        code: languageCode,
      },
      ...(input.components?.length ? { components: input.components } : {}),
    },
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const rawText = await res.text()
  let raw: any = null
  try {
    raw = rawText ? JSON.parse(rawText) : null
  } catch {
    raw = rawText || null
  }

  if (!res.ok) {
    console.error(`[${logLabel}] Meta send failed`, {
      statusCode: res.status,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      phoneId,
      tokenFingerprint,
      templateName: input.templateName,
      templateLanguage: languageCode,
      raw: typeof raw === 'string' ? raw : JSON.stringify(raw),
    })

    return {
      ok: false as const,
      reason: 'send_failed' as const,
      message: typeof raw === 'string' ? raw : JSON.stringify(raw),
      statusCode: res.status,
      raw,
    }
  }

  const messageId = raw?.messages?.[0]?.id ?? null
  return { ok: true as const, messageId, raw }
}

export async function sendTemplateViaWhatsapp(input: WhatsAppTemplateSendInput): Promise<WhatsAppOtpSendResult> {
  return sendTemplateRequest(input)
}

export async function sendOtpViaWhatsapp(phone: string, code: string): Promise<WhatsAppOtpSendResult> {
  const templateConfig = getWhatsAppOtpTemplateConfig()
  const normalizedPhone = normalizeWhatsAppPhoneNumber(phone)
  if (!normalizedPhone) {
    return {
      ok: false,
      reason: 'invalid_phone' as const,
      message: 'Numéro de téléphone invalide.',
      statusCode: 400,
    }
  }

  let result = await sendTemplateRequest({
    phone: normalizedPhone,
    templateName: templateConfig.name,
    language: templateConfig.language,
    components: buildAuthenticationTemplatePayload(normalizedPhone, code, templateConfig.buttonSubType || undefined).template.components,
    logLabel: 'whatsapp-otp',
  })

  if (!result.ok && result.reason === 'send_failed' && !templateConfig.buttonSubType) {
    result = await sendTemplateRequest({
      phone: normalizedPhone,
      templateName: templateConfig.name,
      language: templateConfig.language,
      components: buildAuthenticationTemplatePayload(normalizedPhone, code, 'copy_code').template.components,
      logLabel: 'whatsapp-otp',
    })
  }

  return result
}

export function verifyMetaWebhookSignature(rawBody: string, signatureHeader?: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET
  if (!appSecret) return true
  if (!signatureHeader?.startsWith('sha256=')) return false

  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
  const received = signatureHeader.slice('sha256='.length)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')

  if (expectedBuffer.length !== receivedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}
