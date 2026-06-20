import { prisma } from './prisma'
import { normalizePhoneNumber } from '~~/shared/utils/phone-number'
import { sendTemplateViaWhatsapp } from './whatsapp-otp'

const GUIDE_CONTACT_TEMPLATE_NAME = process.env.WHATSAPP_GUIDE_CONTACT_TEMPLATE_NAME || 'guide_contact_request'
const GUIDE_CONTACT_TEMPLATE_LANGUAGE = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr'
const GUIDE_CONTACT_MAX_PREVIEW_LENGTH = 280

export const GUIDE_CONTACT_INTENT_KEY = 'bdk_pending_guide_contact_path'

export const buildGuideContactMessagePreview = (message: string) => {
  const trimmed = message.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= GUIDE_CONTACT_MAX_PREVIEW_LENGTH) return trimmed
  return `${trimmed.slice(0, GUIDE_CONTACT_MAX_PREVIEW_LENGTH - 1).trimEnd()}…`
}

export async function sendGuideContactRequestViaWhatsapp(input: {
  phoneNumber: string
  guideFirstName?: string | null
  climberName: string
  climberPhoneNumber: string
  messagePreview: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: GUIDE_CONTACT_TEMPLATE_NAME,
    language: GUIDE_CONTACT_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: input.climberName,
          },
          {
            type: 'text',
            text: input.climberPhoneNumber,
          },
          {
            type: 'text',
            text: input.messagePreview,
          },
        ],
      },
    ],
    logLabel: 'whatsapp-guide-contact',
  })
}

export async function consumeGuideContactWebhookPayload(payload: any) {
  const db = await prisma()
  const statuses = (payload?.entry || [])
    .flatMap((entry: any) => entry?.changes || [])
    .flatMap((change: any) => change?.value?.statuses || [])

  for (const status of statuses) {
    const messageId = typeof status?.id === 'string' ? status.id : null
    if (!messageId) continue

    const request = await db.guideContactRequest.findUnique({
      where: { messageId },
      select: { id: true },
    })
    if (!request) continue

    const messageStatus = typeof status?.status === 'string' ? status.status : null
    const failureReason = messageStatus === 'failed'
      ? JSON.stringify(status?.errors || status?.error_data || status || null)
      : null

    await db.guideContactRequest.update({
      where: { id: request.id },
      data: {
        lastWebhookPayload: status,
        ...(messageStatus ? { messageStatus } : {}),
        ...(failureReason ? { failureReason } : {}),
      },
    })
  }
}
