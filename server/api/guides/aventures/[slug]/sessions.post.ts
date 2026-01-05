import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'

const dateSchema = z.preprocess(
  (value) => {
    if (value instanceof Date) return value
    if (typeof value === 'string' && value) return new Date(value)
    return value
  },
  z.date({ required_error: 'Date requise' }),
)

const bodySchema = z
  .object({
    dateDebut: dateSchema,
    dateFin: dateSchema.optional().nullable(),
    placesTotales: z.number().int().min(1).max(30),
  })
  .refine((data) => {
    if (!data.dateFin) return true
    return data.dateFin >= data.dateDebut
  }, { message: 'La date de fin doit être après la date de début', path: ['dateFin'] })

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
  const db = await prisma()

  const aventure = await db.aventure.findFirst({
    where: { slug, guideId: Number(session.user.id) },
    select: { id: true },
  })

  if (!aventure) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  const created = await db.aventureSession.create({
    data: {
      aventureId: aventure.id,
      dateDebut: body.dateDebut,
      dateFin: body.dateFin ?? body.dateDebut,
      statut: 'OUVERT',
      placesTotales: body.placesTotales,
    },
    select: {
      id: true,
      dateDebut: true,
      dateFin: true,
      statut: true,
      placesTotales: true,
      placesReservees: true,
    },
  })

  return { session: created }
})
