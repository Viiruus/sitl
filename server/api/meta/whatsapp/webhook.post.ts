import { consumeGuideContactWebhookPayload } from '../../../utils/whatsapp-guide-contact'
import { consumeGuideWhatsappWebhookPayload } from '../../../utils/whatsapp-guide-otp'
import { verifyMetaWebhookSignature } from '../../../utils/whatsapp-otp'

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing webhook body.' })
  }

  console.info('[meta-whatsapp-webhook] payload_received', {
    contentLength: rawBody.length,
  })

  const signature = getHeader(event, 'x-hub-signature-256')
  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    console.error('[meta-whatsapp-webhook] invalid_signature', {
      hasSignature: Boolean(signature),
    })
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature.' })
  }

  let payload: any = null
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[meta-whatsapp-webhook] invalid_json')
    throw createError({ statusCode: 400, statusMessage: 'Invalid webhook payload.' })
  }

  const statusesCount = (payload?.entry || [])
    .flatMap((entry: any) => entry?.changes || [])
    .flatMap((change: any) => change?.value?.statuses || []).length

  console.info('[meta-whatsapp-webhook] payload_parsed', {
    object: payload?.object || null,
    entryCount: Array.isArray(payload?.entry) ? payload.entry.length : 0,
    statusesCount,
  })

  if (payload?.object !== 'whatsapp_business_account') {
    console.info('[meta-whatsapp-webhook] payload_ignored', {
      object: payload?.object || null,
    })
    return { ok: true, ignored: true }
  }

  await consumeGuideContactWebhookPayload(payload)
  await consumeGuideWhatsappWebhookPayload(payload)
  return { ok: true }
})
