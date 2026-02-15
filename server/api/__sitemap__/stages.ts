import { prisma } from '../../utils/prisma'

export default defineSitemapEventHandler(async () => {
  const db = await prisma()

  const stages = await db.aventure.findMany({
    where: {
      estPublie: true,
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
    }))
})
