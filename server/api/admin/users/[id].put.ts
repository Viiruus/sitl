import { requireAdmin } from '../../../utils/admin-auth'
import { cleanOptionalString, cleanStringList } from '../../../utils/admin-data'
import { adminUserSchema } from '../../../utils/admin-user-schema'

export default defineEventHandler(async (event) => {
  const { db, admin } = await requireAdmin(event)
  const id = Number(event.context.params?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Compte invalide' })
  const body = adminUserSchema.parse(await readBody(event))

  if (id === admin.id && !body.isAdmin) {
    throw createError({ statusCode: 422, statusMessage: 'Tu ne peux pas retirer tes propres droits administrateur.' })
  }

  const existing = await db.user.findUnique({ where: { id }, select: { id: true, email: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Compte introuvable' })
  const email = body.email.toLowerCase()
  const emailOwner = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (emailOwner && emailOwner.id !== id) {
    throw createError({ statusCode: 409, statusMessage: 'Un autre compte utilise déjà cet email.' })
  }

  const guideProfile = body.role === 'GUIDE' ? body.guideProfile : null
  const passwordHash = body.password ? await hashPassword(body.password) : undefined
  const user = await db.user.update({
    where: { id },
    data: {
      email,
      ...(passwordHash ? { passwordHash } : {}),
      role: body.role,
      isAdmin: body.isAdmin,
      acquisitionSource: cleanOptionalString(body.acquisitionSource),
      firstName: cleanOptionalString(body.firstName),
      lastName: cleanOptionalString(body.lastName),
      birthDate: cleanOptionalString(body.birthDate),
      department: cleanOptionalString(body.department),
      phoneNumber: cleanOptionalString(body.phoneNumber),
      whatsappOptIn: body.whatsappOptIn,
      profileImageUrl: cleanOptionalString(body.profileImageUrl),
      typesOfClimbing: cleanStringList(body.typesOfClimbing),
      climbsMainly: cleanOptionalString(body.climbsMainly),
      environments: cleanStringList(body.environments),
      autonomy: cleanStringList(body.autonomy),
      frequency: cleanOptionalString(body.frequency),
      gradeLevel: cleanOptionalString(body.gradeLevel),
      preferredClimbingStyle: cleanOptionalString(body.preferredClimbingStyle),
      climbingGoal: cleanOptionalString(body.climbingGoal),
      boulderingLocations: cleanStringList(body.boulderingLocations),
      boulderingGrade: cleanOptionalString(body.boulderingGrade),
      belayDevices: cleanStringList(body.belayDevices),
      multiAutonomy: cleanStringList(body.multiAutonomy),
      tradProtections: cleanStringList(body.tradProtections),
      tradMovingBelay: cleanOptionalString(body.tradMovingBelay),
      tripStyles: cleanStringList(body.tripStyles),
      onboarded: body.onboarded,
      onboardingStep: body.onboardingStep,
      ...(guideProfile
        ? {
            guideProfile: {
              upsert: {
                create: {
                  gender: guideProfile.gender ?? null,
                  bio: cleanOptionalString(guideProfile.bio),
                  baseLocation: cleanOptionalString(guideProfile.baseLocation),
                  baseLatitude: guideProfile.baseLatitude ?? null,
                  baseLongitude: guideProfile.baseLongitude ?? null,
                  serviceAreas: cleanStringList(guideProfile.serviceAreas),
                  instagramUrl: cleanOptionalString(guideProfile.instagramUrl),
                  googleBusinessUrl: cleanOptionalString(guideProfile.googleBusinessUrl),
                  googlePlaceId: cleanOptionalString(guideProfile.googlePlaceId),
                  professionalCardNumber: cleanOptionalString(guideProfile.professionalCardNumber),
                  stageTermsAndConditions: cleanOptionalString(guideProfile.stageTermsAndConditions),
                  profileImageUrl: cleanOptionalString(guideProfile.profileImageUrl),
                  profileImageVariants: guideProfile.profileImageVariants ?? null,
                  isPublic: guideProfile.isPublic,
                },
                update: {
                  gender: guideProfile.gender ?? null,
                  bio: cleanOptionalString(guideProfile.bio),
                  baseLocation: cleanOptionalString(guideProfile.baseLocation),
                  baseLatitude: guideProfile.baseLatitude ?? null,
                  baseLongitude: guideProfile.baseLongitude ?? null,
                  serviceAreas: cleanStringList(guideProfile.serviceAreas),
                  instagramUrl: cleanOptionalString(guideProfile.instagramUrl),
                  googleBusinessUrl: cleanOptionalString(guideProfile.googleBusinessUrl),
                  googlePlaceId: cleanOptionalString(guideProfile.googlePlaceId),
                  professionalCardNumber: cleanOptionalString(guideProfile.professionalCardNumber),
                  stageTermsAndConditions: cleanOptionalString(guideProfile.stageTermsAndConditions),
                  profileImageUrl: cleanOptionalString(guideProfile.profileImageUrl),
                  profileImageVariants: guideProfile.profileImageVariants ?? null,
                  isPublic: guideProfile.isPublic,
                },
              },
            },
          }
        : {}),
    },
    select: { id: true, email: true, role: true, isAdmin: true },
  })

  return { user }
})
