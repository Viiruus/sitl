import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { isHalfDayStep } from '~~/shared/utils/aventure-schedule'

const createSchema = z.object({
  titre: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(140)
    .regex(/^[a-z0-9-]+$/),
  discipline: z.enum(['FALAISE', 'GRANDE_VOIE', 'BLOC', 'TRAD', 'VIA_FERRATA']),
  lieuLabel: z.string().trim().min(3),
  prixParPersonne: z.number().int().min(0),
  jours: z.number().min(0.5).max(30).refine(isHalfDayStep, 'La durée doit être définie par pas de 0,5 jour.'),
  placesMin: z.number().int().min(0).max(20),
  placesMax: z.number().int().min(1).max(20),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Réservé aux moniteurs' })
  }

  const db = await prisma()
  const body = createSchema.parse(await readBody(event))
  if (body.placesMin > body.placesMax) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Le minimum de participants ne peut pas dépasser le maximum.',
    })
  }

  // Validate unique slug
  const existing = await db.aventure.findUnique({
    where: { slug: body.slug },
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Slug déjà utilisé. Choisis-en un autre.' })
  }

  const aventure = await db.aventure.create({
    data: {
      titre: body.titre,
      slug: body.slug,
      discipline: body.discipline,
      lieuLabel: body.lieuLabel,
      prixParPersonne: body.prixParPersonne,
      jours: body.jours,
      placesMin: body.placesMin,
      placesMax: body.placesMax,
      guideId: Number(session.user.id),
    },
  })

  return { aventure }
})
