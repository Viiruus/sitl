import { prisma } from "../../utils/prisma"
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from "../../utils/public-image"
import { buildGuideSlug } from "~~/shared/utils/guide-slug"

export default defineEventHandler(async () => {
  const db = await prisma()

  const guides = await db.user.findMany({
    where: {
      role: "GUIDE",
    },
    include: {
      guideProfile: true,
      aventures: {
        where: {
          estPublie: true,
        },
        select: {
          discipline: true,
        },
      },
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
  })

  return {
    moniteurs: guides
      .map((guide) => {
        const firstName = guide.firstName?.trim() || null
        const lastName = guide.lastName?.trim() || null
        const profileImageUrl = sanitizePublicImageUrl(guide.guideProfile?.profileImageUrl, { allowInline: true })
        const profileImageVariants = sanitizePublicImageVariants(guide.guideProfile?.profileImageVariants, { allowInline: true })
        const bio = guide.guideProfile?.bio?.trim() || null
        const baseLocation = guide.guideProfile?.baseLocation?.trim() || guide.department?.trim() || null

        if (!firstName || !lastName || !profileImageUrl || !bio || !baseLocation) {
          return null
        }

        return {
          profileImageUrl,
          profileImageVariants,
          id: guide.id,
          slug: buildGuideSlug(firstName, lastName, guide.id),
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          gender: guide.guideProfile?.gender || null,
          bio,
          baseLocation,
          department: guide.department || null,
          disciplines: Array.from(
            new Set(
              (guide.aventures ?? [])
                .map((aventure) => aventure.discipline)
                .filter((value): value is string => typeof value === 'string' && value.length > 0),
            ),
          ),
        }
      })
      .filter(Boolean),
  }
})
