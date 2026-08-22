import { articleContentToMarkdown } from '~~/shared/utils/article-content'
import { prisma } from '../../utils/prisma'
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from '../../utils/public-image'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')?.trim()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }

  const db = await prisma()
  const article = await db.article.findFirst({
    where: { slug, isPublished: true, publishedAt: { not: null } },
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
  })

  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  return {
    article: {
      ...article,
      content: articleContentToMarkdown(article.content),
      coverImageUrl: sanitizePublicImageUrl(article.coverImageUrl, { allowInline: true }),
      coverImageVariants: sanitizePublicImageVariants(article.coverImageVariants, { allowInline: true }),
      author: {
        name: [article.author.firstName, article.author.lastName].filter(Boolean).join(' ').trim() || 'La Brigade du kiff',
        profileImageUrl: sanitizePublicImageUrl(article.author.guideProfile?.profileImageUrl, { allowInline: true }),
        profileImageVariants: sanitizePublicImageVariants(article.author.guideProfile?.profileImageVariants, { allowInline: true }),
      },
    },
  }
})
