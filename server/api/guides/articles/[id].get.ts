import { prisma } from '../../../utils/prisma'
import { readArticleId, requireGuide } from '../../../utils/guide-article'
import { articleContentToMarkdown } from '~~/shared/utils/article-content'

export default defineEventHandler(async (event) => {
  const { guideId } = await requireGuide(event)
  const id = readArticleId(event)
  const db = await prisma()
  const article = await db.article.findFirst({
    where: { id, authorId: guideId },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: { select: { profileImageUrl: true } },
        },
      },
    },
  })

  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  return {
    article: {
      ...article,
      content: articleContentToMarkdown(article.content),
    },
  }
})
