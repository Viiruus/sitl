import { prisma } from '../../utils/prisma'
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from '../../utils/public-image'

const mapGuide = (user: any) => ({
  ...(() => {
    const profileImageUrl = sanitizePublicImageUrl(user.guideProfile?.profileImageUrl)
    const profileImageVariants = sanitizePublicImageVariants(user.guideProfile?.profileImageVariants)
    return {
      profileImageUrl,
      profileImageVariants,
    }
  })(),
  id: user.id,
  email: user.email,
  role: user.role,
  phoneNumber: user.phoneNumber,
  whatsappOptIn: user.whatsappOptIn,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Moniteur',
  baseLocation: user.guideProfile?.baseLocation || null,
  bio: user.guideProfile?.bio || null,
  instagramUrl: user.guideProfile?.instagramUrl || null,
  websiteUrl: user.guideProfile?.websiteUrl || null,
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
