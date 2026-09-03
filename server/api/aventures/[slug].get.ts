// server/api/aventures/[slug].get.ts
import { prisma } from '../../utils/prisma'
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from '../../utils/public-image'
import { buildGuideSlug } from '~~/shared/utils/guide-slug'
import {
  getPublicFutureSessionThreshold,
  isPublicFutureSession,
} from '~~/shared/utils/public-stage-sessions'

export default defineEventHandler(async (event) => {
  const db = await prisma()
  const slug = event.context.params?.slug

  if (!slug || typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug manquant',
    })
  }

  const session = await getUserSession(event)

  const aventure = await db.aventure.findUnique({
    where: { slug },
    include: {
      guide: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          department: true,
          guideProfile: {
            select: {
              gender: true,
              bio: true,
              baseLocation: true,
              baseLatitude: true,
              baseLongitude: true,
              instagramUrl: true,
              profileImageUrl: true,
              profileImageVariants: true,
              professionalCardNumber: true,
              stageTermsAndConditions: true,
            },
          },
        },
      },
      images: true,
      programmeJours: true,
      sessions: {
        include: {
          reservations: {
            where: {
              statut: {
                not: 'ANNULEE',
              },
            },
            select: {
              participants: true,
            },
          },
        },
      },
    },
  })

  if (!aventure) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Aventure introuvable',
    })
  }

  // Récupérer les réservations de l’utilisateur connecté (si connecté)
  let bookedSessionIds = new Set<number>()

  if (session?.user) {
    const userId = Number(session.user.id)
    if (!Number.isNaN(userId)) {
      const userBookings = await db.booking.findMany({
        where: {
          userId,
          session: {
            aventureId: aventure.id,
          },
          statut: {
            not: 'ANNULEE',
          },
        },
        select: {
          sessionId: true,
        },
      })
      bookedSessionIds = new Set(userBookings.map((b) => b.sessionId))
    }
  }

  const autres = await db.aventure.findMany({
    where: {
      estPublie: true,
      slug: { not: slug },
      discipline: aventure.discipline,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      guide: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: {
            select: {
              gender: true,
              profileImageUrl: true,
              profileImageVariants: true,
            },
          },
        },
      },
      sessions: true,
    },
  })

  return {
    aventure: mapDetailAventure(aventure, bookedSessionIds),
    autres: autres.map(mapListAventure),
  }
})

const mapGuide = (a: any) => {
  if (!a.guide) return null
  const gp = a.guide.guideProfile
  const profileImageUrl = sanitizePublicImageUrl(gp?.profileImageUrl, { allowInline: true })
  const profileImageVariants = sanitizePublicImageVariants(gp?.profileImageVariants, { allowInline: true })
  return {
    slug: buildGuideSlug(a.guide.firstName, a.guide.lastName, a.guide.id),
    fullName: [a.guide.firstName, a.guide.lastName].filter(Boolean).join(' ') || null,
    phoneNumber: a.guide.phoneNumber || null,
    department: a.guide.department || null,
    gender: gp?.gender || null,
    professionalCardNumber: gp?.professionalCardNumber || null,
    profile: gp
      ? {
          gender: gp.gender || null,
          bio: gp.bio,
          baseLocation: gp.baseLocation,
          baseLatitude: gp.baseLatitude ?? null,
          baseLongitude: gp.baseLongitude ?? null,
          instagramUrl: gp.instagramUrl,
          professionalCardNumber: gp.professionalCardNumber,
          stageTermsAndConditions: gp.stageTermsAndConditions,
          profileImageUrl,
          profileImageVariants,
        }
      : null,
  }
}

const mapListAventure = (a: any) => ({
  ...(() => {
    const coverImageUrl = sanitizePublicImageUrl(a.coverImageUrl, { allowInline: true })
    const coverImageVariants = sanitizePublicImageVariants(a.coverImageVariants, { allowInline: true })
    const guideImageUrl = sanitizePublicImageUrl(a.guide?.guideProfile?.profileImageUrl, { allowInline: true })
    const guideImageVariants = sanitizePublicImageVariants(a.guide?.guideProfile?.profileImageVariants, { allowInline: true })
    return {
      coverImageUrl,
      coverImageVariants,
      guideImageUrl,
      guideImageVariants,
    }
  })(),
  id: a.id,
  slug: a.slug,
  estPublie: a.estPublie,
  createdAt: a.createdAt,
  titre: a.titre,
  sousTitre: a.sousTitre,
  discipline: a.discipline,
  formule: a.formule,
  lieuLabel: a.lieuLabel,
  latitude: a.latitude,
  longitude: a.longitude,
  jours: a.jours,
  prixParPersonne: a.prixParPersonne,
  guideName:
    [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(' ') || null,
  guideGender: a.guide?.guideProfile?.gender || null,
  guide: mapGuide(a),
  sessions: mapSessions(a.sessions ?? []),
  nextSession: mapNextSession(a.sessions ?? []),
  estComplet: isStageSoldOut(a.sessions ?? [], a.placesMax),
})

const mapDetailAventure = (a: any, bookedSessionIds: Set<number>) => ({
  ...mapListAventure(a),
  pays: a.pays,
  region: a.region,
  inclus: a.inclus,
  nonInclus: a.nonInclus,
  pointsLocaux: a.pointsLocaux,
  niveauMinimum: a.niveauMinimum,
  autonomieMini: a.autonomieMini,
  placesMax: a.placesMax,
  placesMin: a.placesMin,
  devise: a.devise,

  descriptionCourte: a.descriptionCourte,
  descriptionLongue: a.descriptionLongue,
  objectifs: a.objectifs,
  prerequis: a.prerequis,
  equipementRequis: a.equipementRequis,
  equipementFourni: a.equipementFourni,
  hebergementLabel: a.hebergementLabel,
  hebergementDetails: a.hebergementDetails,
  repasLabel: a.repasLabel,
  transportLabel: a.transportLabel,
  pointRdv: a.pointRdv,
  langues: a.langues,
  ageMin: a.ageMin,
  ageMax: a.ageMax,

  images: (a.images ?? [])
    .map((img: any) => ({
      id: img.id,
      url: sanitizePublicImageUrl(img.url, { allowInline: true }),
      alt: img.alt,
      variants: sanitizePublicImageVariants(img.variants, { allowInline: true }),
    }))
    .filter((img: any) => Boolean(img.url)),

  programmeJours: (a.programmeJours ?? [])
    .sort((j1: any, j2: any) => (j1.ordre ?? 0) - (j2.ordre ?? 0))
    .map((j: any) => ({
      id: j.id,
      ordre: j.ordre,
      titre: j.titre,
      lieuLabel: j.lieuLabel,
      description: j.description,
    })),

  guide: mapGuide(a),

    sessions: mapSessions(a.sessions ?? [], a.placesMax, bookedSessionIds),
})

const mapSessions = (sessions: any[], placesMax?: number | null, bookedSessionIds?: Set<number>) =>
  (sessions ?? [])
    .filter((session: any) => isPublicFutureSession(session))
    .sort((s1: any, s2: any) => +s1.dateDebut - +s2.dateDebut)
    .map((session: any) => {
      const participantsCount = Array.isArray(session.reservations)
        ? session.reservations.reduce(
            (total: number, booking: any) =>
              total + (booking?.participants ?? 1),
            0,
          )
        : null
      return {
        id: session.id,
        dateDebut: session.dateDebut,
        dateFin: session.dateFin,
        statut: session.statut,
        placesTotales: placesMax ?? session.placesTotales,
        participantsCount,
        userIsBooked: bookedSessionIds?.has(session.id) ?? false,
      }
    })

const mapNextSession = (sessions: any[]) => {
  const thresholdMs = getPublicFutureSessionThreshold().getTime()
  const future = (sessions ?? [])
    .filter((s: any) => s?.dateDebut)
    .map((s: any) => ({ ...s, _ts: new Date(s.dateDebut).getTime() }))
    .filter((s: any) => !Number.isNaN(s._ts) && s._ts >= thresholdMs)
    .sort((a: any, b: any) => a._ts - b._ts)

  if (!future.length) return null
  const best = { ...future[0] }
  delete best._ts
  return {
    id: best.id,
    dateDebut: best.dateDebut,
    dateFin: best.dateFin,
    statut: best.statut,
    placesTotales: best.placesTotales,
  }
}

const isStageSoldOut = (sessions: any[], placesMax?: number | null) => {
  if (!Array.isArray(sessions) || !sessions.length || !placesMax || placesMax <= 0) return false

  const thresholdMs = getPublicFutureSessionThreshold().getTime()

  const upcoming = sessions.filter((session: any) => {
    const timestamp = session?.dateDebut ? new Date(session.dateDebut).getTime() : Number.NaN
    return !Number.isNaN(timestamp) && timestamp >= thresholdMs
  })

  if (!upcoming.length) return false

  return upcoming.every((session: any) => {
    const participantsCount = Array.isArray(session?.reservations)
      ? session.reservations.reduce(
          (total: number, booking: any) => total + (booking?.participants ?? 1),
          0,
        )
      : session?.placesReservees ?? 0

    return participantsCount >= placesMax
  })
}
