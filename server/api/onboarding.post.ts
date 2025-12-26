// server/api/onboarding.post.ts
import { z } from 'zod'
import pkg from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const { PrismaClient } = pkg
const prisma = new PrismaClient({ adapter })

// Schéma de validation/typage des données reçues du front
const onboardingSchema = z.object({
  // Infos perso
  firstName: z.string().trim().min(1).optional().or(z.literal('')),
  lastName: z.string().trim().min(1).optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')), // string simple
  department: z.string().optional().or(z.literal('')),

  // Pratique
  typesOfClimbing: z.array(z.string()).optional().default([]),
  climbsMainly: z.enum(['lead', 'toprope']).optional().or(z.literal('')),

  environments: z.array(z.string()).optional().default([]),
  autonomy: z.array(z.string()).optional().default([]),

  frequency: z
    .enum(['moins_1', '1', '2_3', 'plus_3'])
    .optional()
    .or(z.literal('')),

  // Niveau
  gradeLevel: z
    .enum(['sub_5a', '5a_5c', '6a_6c', '7_plus', 'dont_know'])
    .optional()
    .or(z.literal('')),

  // Vision du voyage
  tripStyles: z.array(z.string()).optional().default([]),
})

export default defineEventHandler(async (event) => {
  // 1) Vérifier qu'on a bien un utilisateur connecté
  const session = await getUserSession(event) // auto-import nuxt-auth-utils

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
    })
  }

  // 2) Lire et valider le body
  const rawBody = await readBody(event)
  const body = onboardingSchema.parse(rawBody)

  // 4) Mettre à jour l'utilisateur en BDD
  const user = await prisma.user.update({
    where: { id: Number(session.user.id) }, // au cas où l'id soit sérialisé en string
    data: {
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      birthDate: body.birthDate || null,
      department: body.department || null,

      typesOfClimbing: body.typesOfClimbing ?? [],
      climbsMainly: body.climbsMainly || null,
      environments: body.environments ?? [],
      autonomy: body.autonomy ?? [],
      frequency: body.frequency || null,

      gradeLevel: body.gradeLevel || null,
      tripStyles: body.tripStyles ?? [],

      onboarded: true,
      onboardingStep: 3,
    },
  })

  // 5) Mettre à jour la session (pour que user.onboarded soit à jour côté front)
  await setUserSession(event, {
    user: {
      ...session.user,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
    },
  })

  return { ok: true }
})
