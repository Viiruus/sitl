import { prisma } from '../../../utils/prisma'
import {
  articlePayloadSchema,
  createUniqueArticleSlug,
  requireGuide,
} from '../../../utils/guide-article'

export default defineEventHandler(async (event) => {
  const { guideId } = await requireGuide(event)
  const body = articlePayloadSchema.parse(await readBody(event))
  const db = await prisma()
  const slug = await createUniqueArticleSlug(db, body.title)

  const article = await db.article.create({
    data: {
      slug,
      title: body.title,
      coverImageUrl: body.coverImageUrl,
      coverImageVariants: body.coverImageVariants ?? undefined,
      content: body.content,
      authorId: guideId,
    },
  })

  return { article }
})
