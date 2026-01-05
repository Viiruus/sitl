import { prisma } from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const slug = event.context.params?.slug

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }
  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const db = await prisma()
  const guideId = Number(session.user.id)

  const aventure = await db.aventure.findFirst({
    where: { slug, guideId },
    select: { id: true, titre: true, slug: true },
  })

  if (!aventure) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  const bookings = await db.booking.findMany({
    where: {
      session: {
        aventureId: aventure.id,
      },
      // join sessions even if no bookings: we still fetch sessions separately
    },
    include: {
      session: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, whatsappOptIn: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const sessions = await db.aventureSession.findMany({
    where: { aventureId: aventure.id },
    orderBy: { dateDebut: 'asc' },
    select: {
      id: true,
      dateDebut: true,
      dateFin: true,
      statut: true,
    },
  })

  return {
    aventure,
    sessions,
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
      },
      user: b.user,
    })),
  }
})
