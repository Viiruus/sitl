import { z } from 'zod'
import {
  normalizePhoneNumber,
  generateOtpToken,
  isWhatsAppOtpDevFallbackEnabled,
  isWhatsAppOtpPersistentModeEnabled,
  sendOtpViaWhatsapp,
} from '../../utils/whatsapp-otp'
import { requestClimberWhatsappOtp } from '../../utils/whatsapp-climber-otp'

const bodySchema = z.object({
  phoneNumber: z.string().min(6, 'Numéro requis'),
  source: z.string().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber, source } = bodySchema.parse(body)

  const normalized = normalizePhoneNumber(phoneNumber)
  if (!normalized || normalized.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone invalide.' })
  }

  if (isWhatsAppOtpPersistentModeEnabled()) {
    return requestClimberWhatsappOtp({
      phoneNumber: normalized,
      source: source || 'direct',
    })
  }

  const { code, token } = generateOtpToken(normalized, source)
  const sendResult = await sendOtpViaWhatsapp(normalized, code)

  if (!sendResult.ok) {
    const allowDevCode = isWhatsAppOtpDevFallbackEnabled()
    if (allowDevCode) {
      return {
        ok: true,
        token,
        devCode: code,
        notice: sendResult.message || 'WhatsApp non configuré, code renvoyé pour les tests.',
      }
    }
    throw createError({
      statusCode: 500,
      statusMessage:
        sendResult.reason === 'not_configured'
          ? 'WhatsApp non configuré côté serveur.'
          : 'Envoi du code WhatsApp impossible.',
    })
  }

  return { ok: true, token }
})
