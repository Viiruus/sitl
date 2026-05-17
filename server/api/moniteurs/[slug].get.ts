import { prisma } from "../../utils/prisma"
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from "../../utils/public-image"
import { extractGooglePlaceId, fetchGooglePlaceSummary } from "../../utils/google-place-details"
import { buildGuideSlug } from "~~/shared/utils/guide-slug"

const normalizeStringList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []

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
  const coverImageUrl = sanitizePublicImageUrl(a.coverImageUrl, { allowInline: true })
  const coverImageVariants = sanitizePublicImageVariants(a.coverImageVariants, { allowInline: true })
  const nextSession = findNextSession(a.sessions ?? [])
  return {
    id: a.id,
    slug: a.slug,
    estPublie: a.estPublie,
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
  const runtimeConfig = useRuntimeConfig(event)
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
        (candidate) => buildGuideSlug(candidate.firstName, candidate.lastName, candidate.id) === normalizedSlug,
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
  const firstAventureWithCover = aventures.find((a) => sanitizePublicImageUrl(a.coverImageUrl, { allowInline: true }))
  const profileImageUrl = sanitizePublicImageUrl(guide.guideProfile?.profileImageUrl, { allowInline: true })
  const profileImageVariants = sanitizePublicImageVariants(guide.guideProfile?.profileImageVariants, { allowInline: true })
  const firstAventureCoverUrl = sanitizePublicImageUrl(firstAventureWithCover?.coverImageUrl, { allowInline: true })
  const firstAventureCoverVariants = sanitizePublicImageVariants(firstAventureWithCover?.coverImageVariants, { allowInline: true })

  const uniqueDisciplines = Array.from(
    new Set(
      aventures
        .map((a) => a.discipline)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  )
  const googleBusinessUrl = guide.guideProfile?.googleBusinessUrl || null
  const googlePlaceId = guide.guideProfile?.googlePlaceId || extractGooglePlaceId(googleBusinessUrl)
  const googleBusiness = await fetchGooglePlaceSummary({
    apiKey: runtimeConfig.googlePlacesApiKey,
    placeId: googlePlaceId,
    fallbackUrl: googleBusinessUrl,
  })

  const moniteur = {
    id: guide.id,
    slug: buildGuideSlug(guide.firstName, guide.lastName, guide.id),
    firstName: guide.firstName,
    lastName: guide.lastName,
    fullName: [guide.firstName, guide.lastName].filter(Boolean).join(" ") || null,
    gender: guide.guideProfile?.gender || null,
    department: guide.department,
    bio: guide.guideProfile?.bio || null,
    baseLocation: guide.guideProfile?.baseLocation || null,
    serviceAreas: normalizeStringList(guide.guideProfile?.serviceAreas),
    instagramUrl: guide.guideProfile?.instagramUrl || null,
    googleBusinessUrl,
    googleBusiness,
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
