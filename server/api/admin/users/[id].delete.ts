import { requireAdmin } from '../../../utils/admin-auth'
import { deleteStageCascade, recalculateSessionPlaces } from '../../../utils/admin-data'

export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Compte invalide' })
  if (id === admin.id) throw createError({ statusCode: 422, statusMessage: 'Tu ne peux pas supprimer ton propre compte.' })

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      bookings: { select: { sessionId: true } },
      aventures: { select: { id: true } },
    },
  })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Compte introuvable' })

  await db.$transaction(async (tx) => {
    const affectedSessionIds = user.bookings.map((booking) => booking.sessionId)
    await tx.booking.deleteMany({ where: { userId: id } })
    await recalculateSessionPlaces(tx, affectedSessionIds)
    for (const aventure of user.aventures) await deleteStageCascade(tx, aventure.id)
    await tx.guideProfile.deleteMany({ where: { userId: id } })
    await tx.user.delete({ where: { id } })
  })

  return { deleted: true, id }
})

