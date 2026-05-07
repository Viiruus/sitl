import { prisma } from '../../utils/prisma'
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from '../../utils/public-image'
import { buildGuideSlug } from '~~/shared/utils/guide-slug'

const mapGuide = (user: any) => ({
  ...(() => {
    const profileImageUrl = sanitizePublicImageUrl(user.guideProfile?.profileImageUrl, { allowInline: true })
    const profileImageVariants = sanitizePublicImageVariants(user.guideProfile?.profileImageVariants, { allowInline: true })
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
  slug: buildGuideSlug(user.firstName, user.lastName, user.id),
  baseLocation: user.guideProfile?.baseLocation || null,
  bio: user.guideProfile?.bio || null,
  stageTermsAndConditions: user.guideProfile?.stageTermsAndConditions || null,
  instagramUrl: user.guideProfile?.instagramUrl || null,
  websiteUrl: user.guideProfile?.websiteUrl || null,
  aventuresPubliees: user.aventures?.filter((aventure: any) => aventure?.estPublie).length ?? 0,
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
  if (!session.user.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Finalise ton inscription moniteur avant d’accéder au dashboard.' })
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
    },
  })

  if (!guide || guide.role !== 'GUIDE') {
    throw createError({ statusCode: 404, statusMessage: 'Moniteur introuvable' })
  }

  return {
    guide: mapGuide(guide),
  }
})
