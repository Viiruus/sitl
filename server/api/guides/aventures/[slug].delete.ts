import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const slug = event.context.params?.slug

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }
  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const db = await prisma()
  const guideId = Number(session.user.id)

  const aventure = await db.aventure.findFirst({
    where: { slug, guideId },
    select: { id: true, slug: true },
  })

  if (!aventure) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  await db.$transaction(async (tx) => {
    const sessions = await tx.aventureSession.findMany({
      where: { aventureId: aventure.id },
      select: { id: true },
    })

    const sessionIds = sessions.map((row) => row.id)
    if (sessionIds.length) {
      await tx.booking.deleteMany({
        where: {
          sessionId: { in: sessionIds },
        },
      })
      await tx.aventureSession.deleteMany({
        where: {
          id: { in: sessionIds },
        },
      })
    }

    await tx.aventure.delete({
      where: { id: aventure.id },
    })
  })

  return { deleted: true, slug: aventure.slug }
})
