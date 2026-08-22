import { requireAdmin } from '../../../utils/admin-auth'
import { recalculateSessionPlaces } from '../../../utils/admin-data'
import { adminBookingSchema } from '../../../utils/admin-booking-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Réservation invalide' })
  const body = adminBookingSchema.parse(await readBody(event))
  const existing = await db.booking.findUnique({ where: { id }, select: { id: true, sessionId: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Réservation introuvable' })
  const [session, climber] = await Promise.all([
    db.aventureSession.findUnique({ where: { id: body.sessionId }, select: { id: true } }),
    db.user.findFirst({ where: { id: body.userId, role: 'CLIMBER' }, select: { id: true } }),
  ])
  if (!session) throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })
  if (!climber) throw createError({ statusCode: 422, statusMessage: 'Le grimpeur sélectionné est invalide.' })

  const booking = await db.$transaction(async (tx) => {
    const updated = await tx.booking.update({ where: { id }, data: body })
    await recalculateSessionPlaces(tx, [existing.sessionId, body.sessionId])
    return updated
  })
  return { booking }
})

