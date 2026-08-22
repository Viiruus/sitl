import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Stage invalide' })

  const stage = await db.aventure.findUnique({
    where: { id },
    include: {
      guide: { select: { id: true, firstName: true, lastName: true, email: true } },
      images: { orderBy: [{ position: 'asc' }, { id: 'asc' }] },
      programmeJours: { orderBy: { ordre: 'asc' } },
      sessions: { orderBy: { dateDebut: 'asc' }, include: { _count: { select: { reservations: true } } } },
    },
  })
  if (!stage) throw createError({ statusCode: 404, statusMessage: 'Stage introuvable' })
  return { stage }
})

