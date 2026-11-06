import { prisma } from "../../utils/prisma"
import { sanitizePublicImageUrl, sanitizePublicImageVariants } from "../../utils/public-image"
import { buildGuideSlug } from "~~/shared/utils/guide-slug"
import { getPublicFutureSessionThreshold } from "~~/shared/utils/public-stage-sessions"

export default defineEventHandler(async () => {
  const db = await prisma()
  const publicFutureThreshold = getPublicFutureSessionThreshold()

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
          slug: true,
          titre: true,
          discipline: true,
          disciplinesComplementaires: true,
          lieuLabel: true,
          jours: true,
          placesMax: true,
          prixParPersonne: true,
          devise: true,
          descriptionCourte: true,
          niveauMinimum: true,
          sessions: {
            where: {
              dateDebut: { gte: publicFutureThreshold },
              statut: 'OUVERT',
            },
            select: {
              dateDebut: true,
              dateFin: true,
              placesReservees: true,
              prixSpecifique: true,
            },
            orderBy: {
              dateDebut: "asc",
            },
          },
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

        const bookableStages = (guide.aventures ?? []).map(aventure => ({
          ...aventure,
          sessions: aventure.sessions.filter(session => session.placesReservees < aventure.placesMax),
        })).filter(aventure => aventure.sessions.length > 0)
        const nextStage = bookableStages
          .flatMap((aventure) =>
            (aventure.sessions ?? []).map((session) => ({
              slug: aventure.slug,
              titre: aventure.titre,
              lieuLabel: aventure.lieuLabel,
              jours: aventure.jours,
              prixParPersonne: session.prixSpecifique ?? aventure.prixParPersonne,
              devise: aventure.devise,
              descriptionCourte: aventure.descriptionCourte,
              niveauMinimum: aventure.niveauMinimum,
              discipline: aventure.discipline,
              dateDebut: session.dateDebut,
              dateFin: session.dateFin,
            })),
          )
          .sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime())[0] ?? null

        const disciplines = (guide.aventures ?? []).flatMap((aventure) => {
          const complementaires = Array.isArray(aventure.disciplinesComplementaires)
            ? aventure.disciplinesComplementaires.filter((value): value is string => typeof value === 'string')
            : []
          return [aventure.discipline, ...complementaires]
        })

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
          baseLatitude: guide.guideProfile?.baseLatitude ?? null,
          baseLongitude: guide.guideProfile?.baseLongitude ?? null,
          department: guide.department || null,
          serviceAreas: Array.isArray(guide.guideProfile?.serviceAreas)
            ? guide.guideProfile.serviceAreas
              .filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
              .map(value => value.trim())
            : [],
          disciplines: Array.from(new Set(disciplines.filter(value => value.length > 0))),
          publishedStageCount: guide.aventures?.length ?? 0,
          upcomingStageCount: bookableStages.length,
          nextStage,
        }
      })
      .filter(Boolean),
  }
})
