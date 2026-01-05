import { prisma } from '../../../utils/prisma'

const toList = (value: any) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  return []
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const slug = event.context.params?.slug

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }
  if (!slug || typeof slug !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Slug manquant' })
  }

  const db = await prisma()
  const aventure = await db.aventure.findFirst({
    where: { slug, guideId: Number(session.user.id) },
  })

  if (!aventure) {
    throw createError({ statusCode: 404, statusMessage: 'Aventure introuvable' })
  }

  return {
    aventure: {
      estPublie: aventure.estPublie,
      id: aventure.id,
      titre: aventure.titre,
      slug: aventure.slug,
      discipline: aventure.discipline,
      lieuLabel: aventure.lieuLabel,
      prixParPersonne: aventure.prixParPersonne,
      jours: aventure.jours,
      placesMax: aventure.placesMax,
      sousTitre: aventure.sousTitre || '',
      transportLabel: aventure.transportLabel || '',
      niveauMinimum: aventure.niveauMinimum || '',
      descriptionCourte: aventure.descriptionCourte || '',
      descriptionLongue: aventure.descriptionLongue || '',
      ageMin: aventure.ageMin ?? null,
      ageMax: aventure.ageMax ?? null,
      autonomieMini: aventure.autonomieMini || '',
      coverImageUrl: aventure.coverImageUrl || '',
      equipementRequis: toList(aventure.equipementRequis),
      equipementFourni: toList(aventure.equipementFourni),
      hebergementDetails: aventure.hebergementDetails || '',
      inclus: aventure.inclus || '',
      nonInclus: aventure.nonInclus || '',
      objectifs: aventure.objectifs || '',
      prerequis: toList(aventure.prerequis),
      repasLabel: aventure.repasLabel || '',
    },
  }
})
