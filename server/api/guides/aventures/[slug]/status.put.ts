import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'

const bodySchema = z.object({
  estPublie: z.boolean(),
})

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

  const body = bodySchema.parse(await readBody(event))
  if (body.estPublie) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Utilise l’éditeur de stage pour publier cette aventure.',
    })
  }

  const db = await prisma()
  const updated = await db.aventure.updateMany({
    where: {
      slug,
      guideId: Number(session.user.id),
    },
    data: {
      estPublie: false,
    },
  })

  if (!updated.count) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  return { slug, estPublie: false }
})
