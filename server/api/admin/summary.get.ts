import { requireAdmin } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const [guides, climbers, stages, sessions, bookings] = await Promise.all([
    db.user.count({ where: { role: 'GUIDE' } }),
    db.user.count({ where: { role: 'CLIMBER' } }),
    db.aventure.count(),
    db.aventureSession.count(),
    db.booking.count(),
  ])
  return { counts: { guides, climbers, stages, sessions, bookings } }
})

