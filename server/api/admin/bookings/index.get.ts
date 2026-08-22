import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const query = getQuery(event)
  const sessionId = Number(query.sessionId)
  const userId = Number(query.userId)
  const bookings = await db.booking.findMany({
    where: {
      ...(Number.isInteger(sessionId) && sessionId > 0 ? { sessionId } : {}),
      ...(Number.isInteger(userId) && userId > 0 ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true } },
      session: {
        select: {
          id: true,
          dateDebut: true,
          dateFin: true,
          statut: true,
          aventure: { select: { id: true, titre: true, slug: true } },
        },
      },
    },
  })
  return { bookings }
})

