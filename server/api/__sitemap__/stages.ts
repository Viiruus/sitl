import { prisma } from '../../utils/prisma'

export default defineSitemapEventHandler(async () => {
  const db = await prisma()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stages = await db.aventure.findMany({
    where: {
      estPublie: true,
      sessions: {
        some: {
          OR: [
            { dateFin: { gte: today } },
            { dateDebut: { gte: today } },
          ],
        },
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return stages
    .filter((stage) => Boolean(stage.slug))
    .map((stage) => ({
      loc: `/stages-escalade/${stage.slug}`,
      lastmod: stage.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    }))
})
