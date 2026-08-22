// server/api/register.post.ts
import { z } from 'zod'
import { prisma } from '../utils/prisma'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  source: z.string().max(50).optional(), // "landing", "direct", "google", etc.
  phoneNumber: z.string().trim().min(6, 'Ajoute un numéro de téléphone').max(30),
  whatsappOptIn: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const body = await readBody(event)
  const { email, password, source, phoneNumber, whatsappOptIn } = bodySchema.parse(body)

  const normalizedEmail = email.trim().toLowerCase()

  // Vérifier si l'utilisateur existe déjà
  const existing = await db.user.findUnique({
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
  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      phoneNumber: phoneNumber.trim(),
      whatsappOptIn: whatsappOptIn ?? false,
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
      role: user.role,
      isAdmin: user.isAdmin,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return { ok: true }
})
