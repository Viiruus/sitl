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

  const suggestions = await db.aventureDateSuggestion.findMany({
    where: { aventure: { guideId } },
    include: {
      aventure: {
        select: { id: true, titre: true, slug: true, discipline: true },
      },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    suggestions: suggestions.map((s) => ({
      id: s.id,
      startDate: s.startDate,
      endDate: s.endDate,
      comment: s.comment,
      aventure: s.aventure,
      user: {
        id: s.user.id,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        email: s.user.email,
      },
      createdAt: s.createdAt,
    })),
  }
})
