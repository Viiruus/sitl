import { prisma } from '../../utils/prisma'
import { sanitizePublicImageUrl } from '../../utils/public-image'
import { buildGuideSlug } from '~~/shared/utils/guide-slug'

export default defineSitemapEventHandler(async () => {
  const db = await prisma()

  const guides = await db.user.findMany({
    where: { role: 'GUIDE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      updatedAt: true,
      guideProfile: {
        select: {
          profileImageUrl: true,
          bio: true,
          baseLocation: true,
          updatedAt: true,
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return guides
    .filter((guide) => {
      const firstName = guide.firstName?.trim() || ''
      const lastName = guide.lastName?.trim() || ''
      const profileImageUrl = sanitizePublicImageUrl(guide.guideProfile?.profileImageUrl, { allowInline: true })
      const bio = guide.guideProfile?.bio?.trim() || ''
      const baseLocation = guide.guideProfile?.baseLocation?.trim() || guide.department?.trim() || ''

      return Boolean(firstName && lastName && profileImageUrl && bio && baseLocation)
    })
    .map((guide) => {
      const slug = buildGuideSlug(guide.firstName, guide.lastName, guide.id)
      const lastmodDate = guide.guideProfile?.updatedAt || guide.updatedAt
      return {
        loc: `/moniteurs/${slug}`,
        lastmod: lastmodDate.toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      }
    })
})
