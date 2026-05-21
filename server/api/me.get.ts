// server/api/me.get.ts
import { prisma } from '../utils/prisma'
import { isClimberOnboardingComplete } from '../utils/climber-onboarding'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const session = await getUserSession(event)

  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
    })
  }
  if (session.user.role === 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Réservé aux grimpeurs.',
    })
  }

  const normalizedEmail = session.user.email.toLowerCase()

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: {
              aventure: {
                include: {
                  guide: true,
                },
              },
              reservations: {
                where: {
                  statut: {
                    not: 'ANNULEE',
                  },
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Utilisateur introuvable',
    })
  }
  if (user.role === 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Réservé aux grimpeurs.',
    })
  }

  const onboarded = await isClimberOnboardingComplete(db, user)
  if (session.user.onboarded !== onboarded) {
    await setUserSession(event, {
      user: {
        ...session.user,
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboarded,
        role: user.role,
        phoneNumber: user.phoneNumber,
        whatsappOptIn: user.whatsappOptIn,
      },
    })
  }

  // On renvoie l'utilisateur complet (tu peux filtrer si tu veux)
  return { user: { ...user, onboarded } }
})
