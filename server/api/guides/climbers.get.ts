import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  if (!session.user.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Finalise ton inscription moniteur avant d’accéder au dashboard.' })
  }

  const db = await prisma()
  const climbers = await db.user.findMany({
    where: {
      role: 'CLIMBER',
      onboarded: true,
      OR: [
        { firstName: { not: null } },
        { lastName: { not: null } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' },
    ],
  })
  const climberIds = climbers.map((climber) => climber.id)
  const bookingCounts = climberIds.length
    ? await db.booking.groupBy({
        by: ['userId'],
        where: {
          userId: {
            in: climberIds,
          },
          statut: {
            not: 'ANNULEE',
          },
        },
        _count: {
          _all: true,
        },
      })
    : []
  const bookingCountByUserId = new Map(
    bookingCounts.map((entry) => [entry.userId, entry._count._all]),
  )

  return {
    climbers: climbers
      .map((climber) => {
        const firstName = climber.firstName?.trim() || ''
        const lastName = climber.lastName?.trim() || ''
        return {
          id: climber.id,
          firstName,
          lastName,
          fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
          registeredAt: climber.createdAt,
          stageBookingsCount: bookingCountByUserId.get(climber.id) ?? 0,
        }
      })
      .filter((climber) => climber.fullName.length > 0),
  }
})
