import { requireAdmin } from '../../../utils/admin-auth'
import { adminSessionSchema } from '../../../utils/admin-session-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Session invalide' })
  const body = adminSessionSchema.parse(await readBody(event))
  const dateDebut = new Date(body.dateDebut)
  const dateFin = new Date(body.dateFin)
  if (dateFin < dateDebut) throw createError({ statusCode: 422, statusMessage: 'La fin doit être postérieure au début.' })

  const existing = await db.aventureSession.findUnique({ where: { id }, select: { id: true, placesReservees: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Session introuvable' })
  if (body.placesTotales < existing.placesReservees) throw createError({ statusCode: 422, statusMessage: 'Le nombre de places est inférieur aux places réservées.' })
  if (!await db.aventure.findUnique({ where: { id: body.aventureId }, select: { id: true } })) throw createError({ statusCode: 404, statusMessage: 'Stage introuvable' })

  const session = await db.aventureSession.update({
    where: { id },
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

