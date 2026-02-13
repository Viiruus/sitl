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
    where: { role: "GUIDE" },
    include: { guideProfile: true },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
    ],
  })

  return {
    moniteurs: guides.map((guide) => ({
      ...(() => {
        const profileImageUrl = sanitizePublicImageUrl(guide.guideProfile?.profileImageUrl, { allowInline: true })
        const profileImageVariants = sanitizePublicImageVariants(guide.guideProfile?.profileImageVariants, { allowInline: true })
        return {
          profileImageUrl,
          profileImageVariants,
        }
      })(),
      id: guide.id,
      slug: slugifyName(guide.firstName, guide.lastName, guide.id),
      firstName: guide.firstName,
      lastName: guide.lastName,
      fullName: [guide.firstName, guide.lastName].filter(Boolean).join(" ") || "Moniteur local",
      bio: guide.guideProfile?.bio || null,
      baseLocation: guide.guideProfile?.baseLocation || guide.department || null,
    })),
  }
})
