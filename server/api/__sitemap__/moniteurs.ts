import { prisma } from '../../utils/prisma'
import { buildGuideSlug } from '~~/shared/utils/guide-slug'

export default defineSitemapEventHandler(async () => {
  const db = await prisma()

  const guides = await db.user.findMany({
    where: { role: 'GUIDE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      updatedAt: true,
      guideProfile: {
        select: {
          updatedAt: true,
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return guides.map((guide) => {
    const slug = buildGuideSlug(guide.firstName, guide.lastName, guide.id)
    const lastmodDate = guide.guideProfile?.updatedAt || guide.updatedAt
    return {
      loc: `/moniteurs/${slug}`,
      lastmod: lastmodDate.toISOString(),
    }
  })
})
