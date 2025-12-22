import { PrismaClient } from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

export default defineEventHandler(async () => {
  const aventures = await prisma.aventure.findMany({
    where: { estPublie: true },
    include: {
      guide: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: {
            select: {
              profileImageUrl: true,
            },
          },
        },
      },
      sessions: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    aventures: aventures.map((a) => ({
      id: a.id,
      slug: a.slug,
      titre: a.titre,
      sousTitre: a.sousTitre,
      discipline: a.discipline,
      formule: a.formule,
      lieuLabel: a.lieuLabel,
      jours: a.jours,
      prixParPersonne: a.prixParPersonne,
      coverImageUrl: a.coverImageUrl,
      guideName: [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(' ') || null,
      guideImageUrl: a.guide?.guideProfile?.profileImageUrl || null,
      hasSessions: a.sessions.length > 0,
      nextSession: a.sessions.sort((s1, s2) => +s1.dateDebut - +s2.dateDebut)[0] ?? null,
    })),
  }
})
