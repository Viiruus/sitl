import { consumeGuideContactWebhookPayload } from '../../../utils/whatsapp-guide-contact'
import { consumeGuideWhatsappWebhookPayload } from '../../../utils/whatsapp-guide-otp'
import { verifyMetaWebhookSignature } from '../../../utils/whatsapp-otp'

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing webhook body.' })
  }

  const signature = getHeader(event, 'x-hub-signature-256')
  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature.' })
  }

  let payload: any = null
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid webhook payload.' })
  }

  if (payload?.object !== 'whatsapp_business_account') {
    return { ok: true, ignored: true }
  }

  await consumeGuideContactWebhookPayload(payload)
  await consumeGuideWhatsappWebhookPayload(payload)
  return { ok: true }
})
