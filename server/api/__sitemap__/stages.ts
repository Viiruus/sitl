import { prisma } from '../../utils/prisma'
import { getStageSitemapUrls } from '../../utils/sitemap-urls'

export default defineSitemapEventHandler(async () => {
  const db = await prisma()

  return getStageSitemapUrls(db)
})
