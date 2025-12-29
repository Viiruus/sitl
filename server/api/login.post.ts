// server/api/login.post.ts
import { z } from 'zod'
import { prisma } from '../utils/prisma'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const body = await readBody(event)
  const { email, password } = bodySchema.parse(body)

  const normalizedEmail = email.trim().toLowerCase()

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user || !user.passwordHash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Identifiants invalides.',
    })
  }

  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Identifiants invalides.',
    })
  }

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
