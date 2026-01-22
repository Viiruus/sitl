// server/api/aventures/[slug].get.ts
import { prisma } from '../../utils/prisma'

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
          guideProfile: {
            select: {
              bio: true,
              baseLocation: true,
              instagramUrl: true,
              websiteUrl: true,
              profileImageUrl: true,
              professionalCardNumber: true,
            },
          },
        },
      },
      images: true,
      programmeJours: true,
      sessions: true,
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
              profileImageUrl: true,
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

const slugifyName = (
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | number | null,
) => {
  const base = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (!base) return fallback ? String(fallback) : ''
  return base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

const mapGuide = (a: any) => {
  if (!a.guide) return null
  const gp = a.guide.guideProfile
  return {
    slug: slugifyName(a.guide.firstName, a.guide.lastName, a.guide.id),
    fullName: [a.guide.firstName, a.guide.lastName].filter(Boolean).join(' ') || null,
    professionalCardNumber: gp?.professionalCardNumber || null,
    profile: gp
      ? {
          bio: gp.bio,
          baseLocation: gp.baseLocation,
          instagramUrl: gp.instagramUrl,
          websiteUrl: gp.websiteUrl,
          professionalCardNumber: gp.professionalCardNumber,
          profileImageUrl: gp.profileImageUrl,
        }
      : null,
  }
}

const mapListAventure = (a: any) => ({
  id: a.id,
  slug: a.slug,
  titre: a.titre,
  sousTitre: a.sousTitre,
  discipline: a.discipline,
  formule: a.formule,
  lieuLabel: a.lieuLabel,
  jours: a.jours,
  prixParPersonne: a.prixParPersonne,
  coverImageUrl: a.coverImageUrl,
  guideName:
    [a.guide?.firstName, a.guide?.lastName].filter(Boolean).join(' ') || null,
  guide: mapGuide(a),
  guideImageUrl: a.guide?.guideProfile?.profileImageUrl || null,
  sessions: mapSessions(a.sessions ?? []),
  nextSession: mapNextSession(a.sessions ?? []),
})

const mapDetailAventure = (a: any, bookedSessionIds: Set<number>) => ({
  ...mapListAventure(a),
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

  images: a.images?.map((img: any) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
  })) ?? [],

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

  sessions: mapSessions(a.sessions ?? [], bookedSessionIds),
})

const mapSessions = (sessions: any[], bookedSessionIds?: Set<number>) =>
  (sessions ?? [])
    .sort((s1: any, s2: any) => +s1.dateDebut - +s2.dateDebut)
    .map((session: any) => ({
      id: session.id,
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      statut: session.statut,
      placesTotales: session.placesTotales,
      placesReservees: session.placesReservees,
      userIsBooked: bookedSessionIds?.has(session.id) ?? false,
    }))

const mapNextSession = (sessions: any[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const future = (sessions ?? [])
    .filter((s: any) => s?.dateDebut)
    .map((s: any) => ({ ...s, _ts: new Date(s.dateDebut).getTime() }))
    .filter((s: any) => !Number.isNaN(s._ts) && s._ts >= today.getTime())
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
    placesReservees: best.placesReservees,
  }
}
