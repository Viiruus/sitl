import { prisma } from "../../utils/prisma"
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from "../../utils/public-image"

const slugifyName = (firstName?: string | null, lastName?: string | null, fallback?: string | number | null) => {
  const base = [firstName, lastName].filter(Boolean).join(" ").trim()
  if (!base) return fallback ? String(fallback) : ""
  return base
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export default defineEventHandler(async () => {
  const db = await prisma()

  const guides = await db.user.findMany({
    where: {
      role: "GUIDE",
    },
    include: { guideProfile: true },
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
          slug: slugifyName(firstName, lastName, guide.id),
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          bio,
          baseLocation,
        }
      })
      .filter(Boolean),
  }
})
