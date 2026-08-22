import { requireAdmin } from '../../../utils/admin-auth'
import { recalculateSessionPlaces } from '../../../utils/admin-data'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Réservation invalide' })
  const booking = await db.booking.findUnique({ where: { id }, select: { id: true, sessionId: true } })
  if (!booking) throw createError({ statusCode: 404, statusMessage: 'Réservation introuvable' })
  await db.$transaction(async (tx) => {
    await tx.booking.delete({ where: { id } })
    await recalculateSessionPlaces(tx, [booking.sessionId])
  })
  return { deleted: true, id }
})

