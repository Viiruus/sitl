// server/api/me.get.ts
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const session = await getUserSession(event)

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
    })
  }

  const normalizedEmail = session.user.email.toLowerCase()

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: {
              aventure: {
                include: {
                  guide: true,
                },
              },
              reservations: {
                where: {
                  statut: {
                    not: 'ANNULEE',
                  },
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Utilisateur introuvable',
    })
  }

  // On renvoie l'utilisateur complet (tu peux filtrer si tu veux)
  return { user }
})
