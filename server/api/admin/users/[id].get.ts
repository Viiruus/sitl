import { requireAdmin } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Compte invalide' })

  const user = await db.user.findUnique({
    where: { id },
    include: {
      guideProfile: true,
      _count: { select: { aventures: true, bookings: true, associationMemberships: true } },
    },
  })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Compte introuvable' })

  const { passwordHash: _passwordHash, googleId: _googleId, facebookId: _facebookId, ...safeUser } = user
  return { user: safeUser }
})

