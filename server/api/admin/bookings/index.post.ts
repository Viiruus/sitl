import { requireAdmin } from '../../../utils/admin-auth'
import { recalculateSessionPlaces } from '../../../utils/admin-data'
import { adminBookingSchema } from '../../../utils/admin-booking-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const body = adminBookingSchema.parse(await readBody(event))
  const [session, climber] = await Promise.all([
    db.aventureSession.findUnique({ where: { id: body.sessionId }, select: { id: true } }),
    db.user.findFirst({ where: { id: body.userId, role: 'CLIMBER' }, select: { id: true } }),
  ])
  if (!session) throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })
  if (!climber) throw createError({ statusCode: 422, statusMessage: 'Le grimpeur sélectionné est invalide.' })

  const booking = await db.$transaction(async (tx) => {
    const created = await tx.booking.create({ data: body })
    await recalculateSessionPlaces(tx, [body.sessionId])
    return created
  })
  return { booking }
})

