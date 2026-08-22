import { requireAdmin } from '../../../utils/admin-auth'
import { cleanOptionalString, cleanStringList } from '../../../utils/admin-data'
import { adminStageSchema } from '../../../utils/admin-stage-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const body = adminStageSchema.parse(await readBody(event))
  if (body.placesMin > body.placesMax) throw createError({ statusCode: 422, statusMessage: 'Le minimum de places dépasse le maximum.' })
  if ((body.latitude == null) !== (body.longitude == null)) throw createError({ statusCode: 422, statusMessage: 'Latitude et longitude doivent être renseignées ensemble.' })

  const guide = await db.user.findFirst({ where: { id: body.guideId, role: 'GUIDE' }, select: { id: true } })
  if (!guide) throw createError({ statusCode: 422, statusMessage: 'Le moniteur sélectionné est invalide.' })
  if (await db.aventure.findUnique({ where: { slug: body.slug }, select: { id: true } })) {
    throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
  }

  const stage = await db.aventure.create({
    data: {
      guideId: body.guideId,
      slug: body.slug,
      titre: body.titre,
      sousTitre: cleanOptionalString(body.sousTitre),
      discipline: body.discipline,
      formule: body.formule,
      disciplinesComplementaires: cleanStringList(body.disciplinesComplementaires),
      lieuLabel: body.lieuLabel,
      pays: cleanOptionalString(body.pays) ?? 'France',
      region: cleanOptionalString(body.region),
      jours: body.jours,
      placesMax: body.placesMax,
      placesMin: body.placesMin,
      niveauMinimum: cleanOptionalString(body.niveauMinimum),
      autonomieMini: cleanOptionalString(body.autonomieMini),
      prixParPersonne: body.prixParPersonne,
      devise: body.devise.toUpperCase(),
      inclus: cleanOptionalString(body.inclus),
      nonInclus: cleanOptionalString(body.nonInclus),
      pointsLocaux: cleanOptionalString(body.pointsLocaux),
      descriptionCourte: cleanOptionalString(body.descriptionCourte),
      descriptionLongue: cleanOptionalString(body.descriptionLongue),
      objectifs: cleanOptionalString(body.objectifs),
      prerequis: cleanStringList(body.prerequis),
      equipementRequis: cleanStringList(body.equipementRequis),
      equipementFourni: cleanStringList(body.equipementFourni),
      hebergementLabel: cleanOptionalString(body.hebergementLabel),
      hebergementDetails: cleanOptionalString(body.hebergementDetails),
      repasLabel: cleanOptionalString(body.repasLabel),
      transportLabel: cleanOptionalString(body.transportLabel),
      pointRdv: cleanOptionalString(body.pointRdv),
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      langues: cleanStringList(body.langues),
      ageMin: body.ageMin ?? null,
      ageMax: body.ageMax ?? null,
      coverImageUrl: cleanOptionalString(body.coverImageUrl),
      coverImageVariants: body.coverImageVariants ?? null,
      estPublie: body.estPublie,
      images: body.images.length ? { create: body.images.map((image) => ({
        url: image.url,
        kind: image.kind,
        alt: cleanOptionalString(image.alt),
        position: image.position ?? null,
        variants: image.variants ?? null,
      })) } : undefined,
      programmeJours: body.programmeJours.length ? { create: body.programmeJours.map((jour) => ({
        ordre: jour.ordre,
        titre: jour.titre,
        description: cleanOptionalString(jour.description),
        lieuLabel: cleanOptionalString(jour.lieuLabel),
        discipline: jour.discipline ?? null,
      })) } : undefined,
    },
    select: { id: true, slug: true },
  })
  return { stage }
})

