// server/api/me.get.ts
import pkg from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const { PrismaClient } = pkg
const prisma = new PrismaClient({ adapter })

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
    })
  }

  const normalizedEmail = session.user.email.toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: {
              aventure: {
                include: {
                guide: {
                  include: {
                    guideProfile: true,
                  },
                },
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
