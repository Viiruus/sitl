import { requireAdmin } from '../../../utils/admin-auth'
import { adminSessionSchema } from '../../../utils/admin-session-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const body = adminSessionSchema.parse(await readBody(event))
  const dateDebut = new Date(body.dateDebut)
  const dateFin = new Date(body.dateFin)
  if (dateFin < dateDebut) throw createError({ statusCode: 422, statusMessage: 'La fin doit être postérieure au début.' })
  if (!await db.aventure.findUnique({ where: { id: body.aventureId }, select: { id: true } })) throw createError({ statusCode: 404, statusMessage: 'Stage introuvable' })

  const session = await db.aventureSession.create({
    data: {
      aventureId: body.aventureId,
      dateDebut,
      dateFin,
      statut: body.statut,
      placesTotales: body.placesTotales,
      prixSpecifique: body.prixSpecifique ?? null,
    },
  })
  return { session }
})

