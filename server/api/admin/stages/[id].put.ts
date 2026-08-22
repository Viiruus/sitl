import { requireAdmin } from '../../../utils/admin-auth'
import { cleanOptionalString, cleanStringList } from '../../../utils/admin-data'
import { adminStageSchema } from '../../../utils/admin-stage-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Stage invalide' })
  const body = adminStageSchema.parse(await readBody(event))
  if (body.placesMin > body.placesMax) throw createError({ statusCode: 422, statusMessage: 'Le minimum de places dépasse le maximum.' })
  if ((body.latitude == null) !== (body.longitude == null)) throw createError({ statusCode: 422, statusMessage: 'Latitude et longitude doivent être renseignées ensemble.' })

  const existing = await db.aventure.findUnique({ where: { id }, select: { id: true, slug: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Stage introuvable' })
  const guide = await db.user.findFirst({ where: { id: body.guideId, role: 'GUIDE' }, select: { id: true } })
  if (!guide) throw createError({ statusCode: 422, statusMessage: 'Le moniteur sélectionné est invalide.' })
  const slugOwner = await db.aventure.findUnique({ where: { slug: body.slug }, select: { id: true } })
  if (slugOwner && slugOwner.id !== id) throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })

  const stage = await db.$transaction(async (tx) => {
    const updated = await tx.aventure.update({
      where: { id },
      data: {
        guideId: body.guideId,
        slug: body.slug,
        titre: body.titre,
        sousTitre: cleanOptionalString(body.sousTitre),
        discipline: body.discipline,
        formule: body.formule,
        disciplinesComplementaires: cleanStringList(body.disciplinesComplementaires),
        lieuLabel: body.lieuLabel,
        pays: cleanOptionalString(body.pays),
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
      },
      select: { id: true, slug: true },
    })
    await tx.aventureImage.deleteMany({ where: { aventureId: id } })
    if (body.images.length) await tx.aventureImage.createMany({ data: body.images.map((image) => ({
      aventureId: id,
      url: image.url,
      kind: image.kind,
      alt: cleanOptionalString(image.alt),
      position: image.position ?? null,
      variants: image.variants ?? null,
    })) })
    await tx.aventureJour.deleteMany({ where: { aventureId: id } })
    if (body.programmeJours.length) await tx.aventureJour.createMany({ data: body.programmeJours.map((jour) => ({
      aventureId: id,
      ordre: jour.ordre,
      titre: jour.titre,
      description: cleanOptionalString(jour.description),
      lieuLabel: cleanOptionalString(jour.lieuLabel),
      discipline: jour.discipline ?? null,
    })) })
    return updated
  })
  return { stage }
})

