import crypto from 'node:crypto'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

function secret() {
  return (
    process.env.WHATSAPP_AUTH_SECRET ||
    process.env.NUXT_SECRET ||
    process.env.NITRO_PRESET ||
    process.env.NITRO_SECRET ||
    'dev-whatsapp-secret'
  )
}

export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim()
  // remove spaces, hyphens, parentheses
  let normalized = trimmed.replace(/[\s()-]/g, '')
  // convert leading 00 to +
  if (normalized.startsWith('00')) {
    normalized = `+${normalized.slice(2)}`
  }
  return normalized
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

export async function sendOtpViaWhatsapp(phone: string, code: string) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

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
    type: 'text',
    text: {
      preview_url: false,
      body: `Ton code de connexion Brigade du kiff : ${code}\n\nIl expire dans 10 minutes.`,
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

  if (!res.ok) {
    const detail = await res.text()
    return {
      ok: false as const,
      reason: 'send_failed' as const,
      message: detail,
    }
  }

  return { ok: true as const }
}
