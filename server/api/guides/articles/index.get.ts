import { prisma } from '../../../utils/prisma'
import { requireGuide } from '../../../utils/guide-article'

export default defineEventHandler(async (event) => {
  const { guideId } = await requireGuide(event)
  const db = await prisma()
  const articles = await db.article.findMany({
    where: { authorId: guideId },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImageUrl: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return { articles }
})
