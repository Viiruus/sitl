import { prisma } from '../../utils/prisma'

const mapSession = (session: any, placesMax?: number | null) => ({
  id: session.id,
  dateDebut: session.dateDebut,
  dateFin: session.dateFin,
  statut: session.statut,
  placesTotales: placesMax ?? session.placesTotales,
  placesReservees: session.placesReservees,
  bookings: session.reservations?.length || 0,
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }
  if (!session.user.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Finalise ton inscription moniteur avant d’accéder au dashboard.' })
  }

  const db = await prisma()
  const guideId = Number(session.user.id)

  const adventures = await db.aventure.findMany({
    where: { guideId },
    include: {
      sessions: {
        include: {
          reservations: true,
        },
        orderBy: { dateDebut: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    aventures: adventures.map((a) => {
      const upcoming = (a.sessions ?? []).find((s) => new Date(s.dateFin || s.dateDebut) >= new Date())
      return {
        id: a.id,
        titre: a.titre,
        slug: a.slug,
        discipline: a.discipline,
        lieuLabel: a.lieuLabel,
        estPublie: a.estPublie,
        prixParPersonne: a.prixParPersonne,
        jours: a.jours,
        sessions: (a.sessions ?? []).map((session) => mapSession(session, a.placesMax)),
        bookingsCount: (a.sessions ?? []).reduce(
          (total, session) => total + (session.reservations?.length || 0),
          0,
        ),
        prochainSession: upcoming ? mapSession(upcoming, a.placesMax) : null,
      }
    }),
  }
})
