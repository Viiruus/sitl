import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const role = query.role === 'GUIDE' || query.role === 'CLIMBER' ? query.role : undefined

  const users = await db.user.findMany({
    where: {
      ...(role ? { role } : { role: { in: ['GUIDE', 'CLIMBER'] } }),
      ...(search
        ? {
            OR: [
              { email: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { phoneNumber: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      email: true,
      role: true,
      isAdmin: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      onboarded: true,
      createdAt: true,
      guideProfile: { select: { baseLocation: true, isPublic: true } },
      _count: { select: { aventures: true, bookings: true } },
    },
  })

  return { users }
})

