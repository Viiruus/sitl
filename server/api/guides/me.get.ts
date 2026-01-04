import { prisma } from '../../utils/prisma'

const mapGuide = (user: any) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Moniteur',
  baseLocation: user.guideProfile?.baseLocation || null,
  bio: user.guideProfile?.bio || null,
  instagramUrl: user.guideProfile?.instagramUrl || null,
  websiteUrl: user.guideProfile?.websiteUrl || null,
  profileImageUrl: user.guideProfile?.profileImageUrl || null,
  aventuresPubliees: user._count?.aventures ?? 0,
  prochainesSessions: user.aventures?.reduce((total: number, a: any) => total + (a.sessions?.length ?? 0), 0) ?? 0,
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const db = await prisma()
  const guide = await db.user.findUnique({
    where: { id: Number(session.user.id) },
    include: {
      guideProfile: true,
      aventures: {
        include: {
          sessions: true,
        },
      },
      _count: {
        select: {
          aventures: true,
        },
      },
    },
  })

  if (!guide || guide.role !== 'GUIDE') {
    throw createError({ statusCode: 404, statusMessage: 'Moniteur introuvable' })
  }

  return {
    guide: mapGuide(guide),
  }
})
