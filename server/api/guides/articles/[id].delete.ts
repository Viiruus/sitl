import { prisma } from '../../../utils/prisma'
import { readArticleId, requireGuide } from '../../../utils/guide-article'

export default defineEventHandler(async (event) => {
  const { guideId } = await requireGuide(event)
  const id = readArticleId(event)
  const db = await prisma()
  const existing = await db.article.findFirst({ where: { id, authorId: guideId }, select: { id: true } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  }

  await db.article.delete({ where: { id } })
  return { deleted: true, id }
})
