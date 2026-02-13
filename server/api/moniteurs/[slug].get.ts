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

const findNextSession = (sessions: any[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()

  const future = (sessions ?? [])
    .filter((s: any) => s?.dateDebut)
    .map((s: any) => ({ ...s, _ts: new Date(s.dateDebut).getTime() }))
    .filter((s: any) => !Number.isNaN(s._ts) && s._ts >= todayMs)
    .sort((a: any, b: any) => a._ts - b._ts)

  if (!future.length) return null
  const best = { ...future[0] }
  delete best._ts
  return best
}

const mapAventureForGuide = (a: any) => {
  const coverImageUrl = sanitizePublicImageUrl(a.coverImageUrl)
  const coverImageVariants = sanitizePublicImageVariants(a.coverImageVariants)
  const nextSession = findNextSession(a.sessions ?? [])
  return {
    id: a.id,
    slug: a.slug,
    titre: a.titre,
    sousTitre: a.sousTitre,
    discipline: a.discipline,
    lieuLabel: a.lieuLabel,
    jours: a.jours,
    prixParPersonne: a.prixParPersonne,
    coverImageUrl,
    coverImageVariants,
    nextSession: nextSession
      ? {
          dateDebut: nextSession.dateDebut,
          dateFin: nextSession.dateFin,
        }
      : null,
  }
}

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const normalizedSlug = typeof slug === "string" ? slug.toLowerCase() : null

  if (!normalizedSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug manquant",
    })
  }

  const db = await prisma()

  let guide = null
  const numericId = Number(normalizedSlug)
  if (!Number.isNaN(numericId)) {
    guide = await db.user.findUnique({
      where: { id: numericId },
      include: { guideProfile: true },
    })
  }

  if (!guide) {
    const candidateGuides = await db.user.findMany({
      where: {
        role: "GUIDE",
      },
      include: { guideProfile: true },
    })
    guide =
      candidateGuides.find(
        (candidate) => slugifyName(candidate.firstName, candidate.lastName, candidate.id) === normalizedSlug,
      ) || null
  }

  if (!guide || guide.role !== "GUIDE") {
    throw createError({
      statusCode: 404,
      statusMessage: "Moniteur introuvable",
    })
  }

  const aventures = await db.aventure.findMany({
    where: { guideId: guide.id, estPublie: true },
    include: {
      sessions: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const allSessions = aventures.flatMap((a) => a.sessions || [])
  const nextSessionDate = findNextSession(allSessions)?.dateDebut ?? null
  const firstAventureWithCover = aventures.find((a) => sanitizePublicImageUrl(a.coverImageUrl))
  const profileImageUrl = sanitizePublicImageUrl(guide.guideProfile?.profileImageUrl)
  const profileImageVariants = sanitizePublicImageVariants(guide.guideProfile?.profileImageVariants)
  const firstAventureCoverUrl = sanitizePublicImageUrl(firstAventureWithCover?.coverImageUrl)
  const firstAventureCoverVariants = sanitizePublicImageVariants(firstAventureWithCover?.coverImageVariants)

  const uniqueDisciplines = Array.from(
    new Set(
      aventures
        .map((a) => a.discipline)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  )

  const moniteur = {
    id: guide.id,
    slug: slugifyName(guide.firstName, guide.lastName, guide.id),
    firstName: guide.firstName,
    lastName: guide.lastName,
    fullName: [guide.firstName, guide.lastName].filter(Boolean).join(" ") || null,
    department: guide.department,
    bio: guide.guideProfile?.bio || null,
    baseLocation: guide.guideProfile?.baseLocation || null,
    instagramUrl: guide.guideProfile?.instagramUrl || null,
    websiteUrl: guide.guideProfile?.websiteUrl || null,
    professionalCardNumber: guide.guideProfile?.professionalCardNumber || null,
    profileImageUrl,
    profileImageVariants,
    heroImageUrl:
      profileImageUrl ||
      firstAventureCoverUrl ||
      "/images/escalade-grande-voie-calanques.jpg",
    heroImageVariants:
      profileImageVariants ||
      firstAventureCoverVariants ||
      null,
    stats: {
      aventuresPubliees: aventures.length,
      sessionsPlanifiees: allSessions.length,
      prochaineDate: nextSessionDate,
    },
    disciplines: uniqueDisciplines,
  }

  return {
    moniteur,
    aventures: aventures.map(mapAventureForGuide),
  }
})
