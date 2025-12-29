import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const slug = event.context.params?.slug
  if (!slug || typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug manquant',
    })
  }

  const session = await getUserSession(event)
  const userId = Number(session?.user?.id)
  if (!userId || Number.isNaN(userId)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tu dois être connecté·e pour proposer des dates.',
    })
  }

  const aventure = await db.aventure.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!aventure) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Aventure introuvable',
    })
  }

  const body = await readBody<{
    startDate: string
    endDate?: string
    comment?: string
  }>(event)

  if (!body?.startDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Merci de sélectionner au moins une date.',
    })
  }

  const startDate = new Date(body.startDate)
  if (Number.isNaN(+startDate)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Date de début invalide.',
    })
  }

  let endDate: Date | null = null
  if (body.endDate) {
    endDate = new Date(body.endDate)
    if (Number.isNaN(+endDate)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Date de fin invalide.',
      })
    }
  }

  const userExists = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!userExists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Utilisateur introuvable.',
    })
  }

  const suggestion = await db.aventureDateSuggestion.create({
    data: {
      aventure: { connect: { id: aventure.id } },
      user: { connect: { id: userId } },
      startDate,
      endDate: endDate ?? startDate,
      comment: body.comment?.slice(0, 500) ?? null,
    },
  })

  return {
    suggestion,
    message: 'Merci ! Nous notons ces disponibilités.',
  }
})
