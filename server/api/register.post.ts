// server/api/register.post.ts
import { z } from 'zod'
import { PrismaClient } from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  source: z.string().max(50).optional(), // "landing", "direct", "google", etc.
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, source } = bodySchema.parse(body)

  const normalizedEmail = email.trim().toLowerCase()

  // Vérifier si l'utilisateur existe déjà
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Un compte existe déjà avec cet email.',
    })
  }

  // Hasher le mot de passe
  const passwordHash = await hashPassword(password)

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      acquisitionSource: source ?? null,
      onboarded: false,
      onboardingStep: 0,
    },
  })

  // Créer la session utilisateur
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
    },
  })

  return { ok: true }
})
