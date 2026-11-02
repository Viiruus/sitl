import { requireAdmin } from '../../utils/admin-auth'
import { adminWhatsAppQuerySchema, listAdminWhatsAppMessages } from '../../utils/admin-whatsapp-messages'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { db } = await requireAdmin(event)
  const parsed = adminWhatsAppQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Filtres invalides.' })
  }
  return listAdminWhatsAppMessages(db, parsed.data)
})
