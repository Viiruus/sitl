import { z } from 'zod'
import { prisma } from '../../utils/prisma'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  baseLocation: z.string().max(160).optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const body = await readBody(event)
  const { email, password, firstName, lastName, baseLocation } = bodySchema.parse(body)

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Un compte existe déjà avec cet email.`,
    })
  }

  const passwordHash = await hashPassword(password)

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      role: 'GUIDE',
      onboarded: true,
      acquisitionSource: 'guide',
      guideProfile: {
        create: {
          bio: '',
          baseLocation: baseLocation || null,
          instagramUrl: null,
          websiteUrl: null,
          profileImageUrl: null,
          isPublic: true,
        },
      },
    },
    include: {
      guideProfile: true,
    },
  })

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
      role: user.role,
    },
  })

  return { ok: true }
})
