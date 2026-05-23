import { prisma } from '../../utils/prisma'
import { getGuideSitemapUrls } from '../../utils/sitemap-urls'

export default defineSitemapEventHandler(async () => {
  const db = await prisma()

  return getGuideSitemapUrls(db)
})
