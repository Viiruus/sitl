import { z } from 'zod'
import { prisma } from '../../utils/prisma'

const bodySchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  cguAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Merci de valider les CGU.' }),
  }),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const body = bodySchema.parse(await readBody(event))
  const db = await prisma()

  const user = await db.user.update({
    where: { id: Number(session.user.id) },
    data: {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      onboarded: true,
      onboardingStep: 1,
    },
  })

  await setUserSession(event, {
    user: {
      ...session.user,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
      role: user.role,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return { ok: true }
})
