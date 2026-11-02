import {
  GUIDE_WHATSAPP_MESSAGE_KINDS,
  getGuideWhatsAppMessageDetails,
  type AdminGuideWhatsAppMessage,
} from '~~/shared/utils/guide-whatsapp-messages'
import { z } from 'zod'

export const adminWhatsAppQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(100000).default(1),
  search: z.string().trim().max(150).default(''),
  kind: z.enum(GUIDE_WHATSAPP_MESSAGE_KINDS).optional(),
  status: z.enum(['pending', 'accepted', 'sent', 'delivered', 'read', 'failed']).optional(),
})

export async function listAdminWhatsAppMessages(db: any, query: z.infer<typeof adminWhatsAppQuerySchema>) {
  const pageSize = 30
  const where = {
    kind: query.kind || { in: [...GUIDE_WHATSAPP_MESSAGE_KINDS] },
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? {
      OR: [
        { guideNameSnapshot: { contains: query.search } },
        { phoneNumber: { contains: query.search } },
      ],
    } : {}),
  }
  const total = await db.guideWhatsAppMessage.count({ where })
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(query.page, pageCount)
  const rows = await db.guideWhatsAppMessage.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true, guideId: true, guideNameSnapshot: true, phoneNumber: true,
      kind: true, templateName: true, language: true, status: true,
      messageId: true, failureReason: true, createdAt: true, sentAt: true, components: true,
    },
  })
  const messages: AdminGuideWhatsAppMessage[] = rows.map((row: any) => ({
    id: row.id,
    guideId: row.guideId,
    guideName: row.guideNameSnapshot,
    phoneNumber: row.phoneNumber,
    kind: row.kind,
    templateName: row.templateName,
    language: row.language,
    status: row.status,
    messageId: row.messageId,
    failureReason: row.failureReason,
    createdAt: new Date(row.createdAt).toISOString(),
    sentAt: row.sentAt ? new Date(row.sentAt).toISOString() : null,
    details: getGuideWhatsAppMessageDetails(row.kind, row.components),
  }))
  return { messages, total, page, pageSize, pageCount }
}
