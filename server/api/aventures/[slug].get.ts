// server/api/aventures/[slug].get.ts
import { PrismaClient } from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug

  if (!slug || typeof slug !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug manquant',
    })
  }

  const session = await getUserSession(event)

  const aventure = await prisma.aventure.findUnique({
    where: { slug },
    include: {
      guide: {
        select: {
          firstName: true,
          lastName: true,
          guideProfile: {
            select: {
              bio: true,
              baseLocation: true,
              instagramUrl: true,
              websiteUrl: true,
              profileImageUrl: true,
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
      const userBookings = await prisma.booking.findMany({
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

  const autres = await prisma.aventure.findMany({
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
        },
      },
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
  return {
    fullName: [a.guide.firstName, a.guide.lastName].filter(Boolean).join(' ') || null,
    profile: gp
      ? {
          bio: gp.bio,
          baseLocation: gp.baseLocation,
          instagramUrl: gp.instagramUrl,
          websiteUrl: gp.websiteUrl,
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

  sessions: (a.sessions ?? [])
    .sort((s1: any, s2: any) => +s1.dateDebut - +s2.dateDebut)
    .map((session: any) => ({
      id: session.id,
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      statut: session.statut,
      placesTotales: session.placesTotales,
      placesReservees: session.placesReservees,
      userIsBooked: bookedSessionIds.has(session.id),
    })),
})
