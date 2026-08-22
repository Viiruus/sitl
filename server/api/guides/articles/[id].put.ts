import { prisma } from '../../../utils/prisma'
import {
  articlePayloadSchema,
  readArticleId,
  requireGuide,
} from '../../../utils/guide-article'

export default defineEventHandler(async (event) => {
  const { guideId } = await requireGuide(event)
  const id = readArticleId(event)
  const body = articlePayloadSchema.parse(await readBody(event))
  const db = await prisma()
  const existing = await db.article.findFirst({ where: { id, authorId: guideId }, select: { id: true } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  const article = await db.article.update({
    where: { id },
    data: {
      title: body.title,
      coverImageUrl: body.coverImageUrl,
      coverImageVariants: body.coverImageVariants ?? undefined,
      content: body.content,
    },
  })

  return { article }
})
