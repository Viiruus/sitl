import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const db = await prisma()
  const guideId = Number(session.user.id)

  const requests = await db.guideContactRequest.findMany({
    where: { guideId },
    include: {
      climber: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    contactRequests: requests.map((request) => ({
      id: request.id,
      message: request.message,
      messagePreview: request.messagePreview,
      climberNameSnapshot: request.climberNameSnapshot,
      climberPhoneSnapshot: request.climberPhoneSnapshot,
      messageStatus: request.messageStatus,
      sentAt: request.sentAt,
      createdAt: request.createdAt,
      climber: request.climber
        ? {
            id: request.climber.id,
            firstName: request.climber.firstName,
            lastName: request.climber.lastName,
            email: request.climber.email,
          }
        : null,
    })),
  }
})
