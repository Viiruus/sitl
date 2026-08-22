import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Session invalide' })
  const session = await db.aventureSession.findUnique({ where: { id }, select: { id: true, aventureId: true } })
  if (!session) throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })

  const result = await db.$transaction(async (tx) => {
    await tx.booking.deleteMany({ where: { sessionId: id } })
    await tx.aventureSession.delete({ where: { id } })
    const remaining = await tx.aventureSession.count({ where: { aventureId: session.aventureId } })
    if (remaining === 0) await tx.aventure.update({ where: { id: session.aventureId }, data: { estPublie: false } })
    return { unpublishedStage: remaining === 0 }
  })
  return { deleted: true, id, ...result }
})

