import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const guideId = Number(query.guideId)

  const stages = await db.aventure.findMany({
    where: {
      ...(Number.isInteger(guideId) && guideId > 0 ? { guideId } : {}),
      ...(search
        ? { OR: [{ titre: { contains: search } }, { lieuLabel: { contains: search } }, { slug: { contains: search } }] }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      titre: true,
      discipline: true,
      lieuLabel: true,
      prixParPersonne: true,
      estPublie: true,
      updatedAt: true,
      guide: { select: { id: true, firstName: true, lastName: true, email: true } },
      sessions: {
        orderBy: { dateDebut: 'asc' },
        select: { id: true, dateDebut: true, dateFin: true, statut: true, placesTotales: true, placesReservees: true },
      },
      _count: { select: { sessions: true } },
    },
  })
  return { stages }
})
