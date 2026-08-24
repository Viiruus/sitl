import { requireAdmin } from '../../../utils/admin-auth'
import { cleanOptionalString, cleanStringList } from '../../../utils/admin-data'
import { adminUserSchema } from '../../../utils/admin-user-schema'

export default defineEventHandler(async (event) => {
  const { db } = await requireAdmin(event)
  const body = adminUserSchema.parse(await readBody(event))
  const email = body.email.toLowerCase()

  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    throw createError({ statusCode: 409, statusMessage: 'Un compte existe déjà avec cet email.' })
  }

  const passwordHash = body.password ? await hashPassword(body.password) : null
  const guideProfile = body.role === 'GUIDE' ? body.guideProfile : null

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
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
            },
          }
        : {}),
    },
    select: { id: true, email: true, role: true, isAdmin: true },
  })

  return { user }
})
