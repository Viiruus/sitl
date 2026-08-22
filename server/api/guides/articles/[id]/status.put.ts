import { prisma } from '../../../../utils/prisma'
import {
  articlePayloadSchema,
  articleStatusSchema,
  readArticleId,
  requireGuide,
} from '../../../../utils/guide-article'
import { articleContentToMarkdown } from '~~/shared/utils/article-content'

export default defineEventHandler(async (event) => {
  const { guideId } = await requireGuide(event)
  const id = readArticleId(event)
  const body = articleStatusSchema.parse(await readBody(event))
  const db = await prisma()
  const existing = await db.article.findFirst({ where: { id, authorId: guideId } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  if (body.isPublished) {
    articlePayloadSchema.parse({
      title: existing.title,
      coverImageUrl: existing.coverImageUrl,
      coverImageVariants: existing.coverImageVariants,
      content: articleContentToMarkdown(existing.content),
    })
  }

  const article = await db.article.update({
    where: { id },
    data: {
      isPublished: body.isPublished,
      publishedAt: body.isPublished ? (existing.publishedAt ?? new Date()) : null,
    },
    select: { id: true, isPublished: true, publishedAt: true },
  })

  return { article }
})
