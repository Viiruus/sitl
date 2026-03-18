export default defineEventHandler((event) => {
  const query = getQuery(event)
  const mode = typeof query['hub.mode'] === 'string' ? query['hub.mode'] : ''
  const token = typeof query['hub.verify_token'] === 'string' ? query['hub.verify_token'] : ''
  const challenge = typeof query['hub.challenge'] === 'string' ? query['hub.challenge'] : ''
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.META_WEBHOOK_VERIFY_TOKEN || ''

  if (mode === 'subscribe' && expectedToken && token === expectedToken) {
    return challenge
  }

  throw createError({ statusCode: 403, statusMessage: 'Webhook verification failed.' })
})
