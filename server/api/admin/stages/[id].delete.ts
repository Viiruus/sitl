import { requireAdmin } from '../../../utils/admin-auth'
import { deleteStageCascade } from '../../../utils/admin-data'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Stage invalide' })
  if (!await db.aventure.findUnique({ where: { id }, select: { id: true } })) throw createError({ statusCode: 404, statusMessage: 'Stage introuvable' })
  await db.$transaction((tx) => deleteStageCascade(tx, id))
  return { deleted: true, id }
})

