import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const db = await prisma()
  const guideId = Number(session.user.id)

  const bookings = await db.booking.findMany({
    where: {
      session: {
        aventure: { guideId },
      },
    },
    include: {
      session: {
        include: {
          aventure: {
            select: { id: true, titre: true, slug: true, discipline: true },
          },
        },
      },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      statut: b.statut,
      participants: b.participants,
      montant: b.montant,
      createdAt: b.createdAt,
      session: {
        id: b.session.id,
        dateDebut: b.session.dateDebut,
        dateFin: b.session.dateFin,
        aventure: b.session.aventure,
      },
      user: b.user,
    })),
  }
})
