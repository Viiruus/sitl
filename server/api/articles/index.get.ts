import { articleMarkdownExcerpt } from '~~/shared/utils/article-content'
import { prisma } from '../../utils/prisma'
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from '../../utils/public-image'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestedLimit = Number(query.limit)
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : undefined
  const db = await prisma()

  const articles = await db.article.findMany({
    where: { isPublished: true, publishedAt: { not: null } },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImageUrl: true,
      coverImageVariants: true,
      content: true,
      publishedAt: true,
      updatedAt: true,
      author: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: { select: { profileImageUrl: true, profileImageVariants: true } },
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })

  return {
    articles: articles.map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: articleMarkdownExcerpt(article.content),
      coverImageUrl: sanitizePublicImageUrl(article.coverImageUrl, { allowInline: true }),
      coverImageVariants: sanitizePublicImageVariants(article.coverImageVariants, { allowInline: true }),
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      author: {
        name: [article.author.firstName, article.author.lastName].filter(Boolean).join(' ').trim() || 'La Brigade du kiff',
        profileImageUrl: sanitizePublicImageUrl(article.author.guideProfile?.profileImageUrl, { allowInline: true }),
        profileImageVariants: sanitizePublicImageVariants(article.author.guideProfile?.profileImageVariants, { allowInline: true }),
      },
    })),
  }
})
