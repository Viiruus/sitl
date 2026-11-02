import { prisma } from './prisma'
import { normalizePhoneNumber } from '~~/shared/utils/phone-number'
import { GUIDE_WHATSAPP_MESSAGE_KINDS } from '~~/shared/utils/guide-whatsapp-messages'
import type { WhatsAppTemplateSendInput, WhatsAppOtpSendResult } from './whatsapp-otp'

// L’historique ne doit jamais modifier le résultat d’un envoi ni déclencher
// un second envoi en cas de problème d’écriture en base.
export async function recordGuideWhatsAppSend(
  input: WhatsAppTemplateSendInput,
  send: () => Promise<WhatsAppOtpSendResult>,
): Promise<WhatsAppOtpSendResult> {
  let db: any = null
  let logId: number | null = null
  const context = input.guideMessage

  if (context && GUIDE_WHATSAPP_MESSAGE_KINDS.includes(context.kind)) {
    try {
      db = await prisma()
      const guide = await db.user.findUnique({
        where: { id: context.guideId },
        select: { id: true, role: true, firstName: true, lastName: true, email: true },
      })
      if (guide?.role === 'GUIDE') {
        const log = await db.guideWhatsAppMessage.create({
          data: {
            guideId: guide.id,
            guideNameSnapshot: [guide.firstName, guide.lastName].filter(Boolean).join(' ') || guide.email,
            phoneNumber: normalizePhoneNumber(input.phone) || input.phone,
            kind: context.kind,
            templateName: input.templateName,
            language: input.language || process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr',
            components: input.components || [],
          },
        })
        logId = log.id
      }
    } catch (error) {
      console.error('[guide-whatsapp-history] Impossible de créer l’entrée d’historique', error)
    }
  }

  const update = async (data: Record<string, unknown>) => {
    if (!logId) return
    try {
      await db.guideWhatsAppMessage.update({ where: { id: logId }, data })
    } catch (error) {
      console.error('[guide-whatsapp-history] Impossible de mettre à jour l’historique', error)
    }
  }

  try {
    const result = await send()
    await update(result.ok
      ? { messageId: result.messageId, status: 'accepted', sentAt: new Date(), failureReason: null }
      : { status: 'failed', failureReason: result.message.slice(0, 2000) })
    return result
  } catch (error) {
    await update({ status: 'failed', failureReason: 'Erreur réseau ou interruption pendant l’envoi à WhatsApp.' })
    throw error
  }
}

const previousStatuses: Record<string, string[]> = {
  sent: ['pending', 'accepted', 'sent'],
  delivered: ['pending', 'accepted', 'sent', 'delivered'],
  read: ['pending', 'accepted', 'sent', 'delivered', 'read'],
  failed: ['pending', 'accepted', 'sent', 'delivered', 'failed'],
}

export async function consumeGuideMessageHistoryWebhook(payload: any) {
  const db = await prisma()
  const statuses = (payload?.entry || [])
    .flatMap((entry: any) => entry?.changes || [])
    .flatMap((change: any) => change?.value?.statuses || [])

  for (const status of statuses) {
    if (typeof status?.id !== 'string' || !previousStatuses[status.status]) continue
    const timestamp = Number(status.timestamp)
    const statusAt = Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp * 1000) : null
    if (statusAt && Number.isNaN(statusAt.getTime())) continue
    await db.guideWhatsAppMessage.updateMany({
      where: {
        messageId: status.id,
        status: { in: previousStatuses[status.status] },
        ...(statusAt ? { OR: [{ statusAt: null }, { statusAt: { lte: statusAt } }] } : {}),
      },
      data: {
        status: status.status,
        ...(statusAt ? { statusAt } : {}),
        failureReason: status.status === 'failed'
          ? JSON.stringify(status.errors || status.error_data || 'Échec signalé par WhatsApp').slice(0, 2000)
          : null,
      },
    })
  }
}
