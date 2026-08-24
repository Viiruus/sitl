import { z } from 'zod'

const optionalText = z.string().trim().max(2000).optional().nullable()
const optionalShortText = z.string().trim().max(255).optional().nullable()
const optionalList = z.array(z.string().trim().max(255)).max(100).optional().nullable()

export const adminUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200).optional().or(z.literal('')),
  role: z.enum(['CLIMBER', 'GUIDE']),
  isAdmin: z.boolean().default(false),
  acquisitionSource: optionalShortText,
  firstName: z.string().trim().max(100).optional().nullable(),
  lastName: z.string().trim().max(100).optional().nullable(),
  birthDate: optionalShortText,
  department: optionalShortText,
  phoneNumber: z.string().trim().max(30).optional().nullable(),
  whatsappOptIn: z.boolean().default(false),
  profileImageUrl: optionalText,
  typesOfClimbing: optionalList,
  climbsMainly: optionalShortText,
  environments: optionalList,
  autonomy: optionalList,
  frequency: optionalShortText,
  gradeLevel: optionalShortText,
  preferredClimbingStyle: optionalShortText,
  climbingGoal: optionalText,
  boulderingLocations: optionalList,
  boulderingGrade: optionalShortText,
  belayDevices: optionalList,
  multiAutonomy: optionalList,
  tradProtections: optionalList,
  tradMovingBelay: optionalShortText,
  tripStyles: optionalList,
  onboarded: z.boolean().default(false),
  onboardingStep: z.number().int().min(0).max(100).default(0),
  guideProfile: z.object({
    gender: z.enum(['male', 'female']).optional().nullable(),
    bio: optionalText,
    baseLocation: optionalShortText,
    baseLatitude: z.number().min(-90).max(90).optional().nullable(),
    baseLongitude: z.number().min(-180).max(180).optional().nullable(),
    serviceAreas: optionalList,
    instagramUrl: optionalText,
    googleBusinessUrl: optionalText,
    googlePlaceId: optionalShortText,
    professionalCardNumber: optionalShortText,
    stageTermsAndConditions: z.string().trim().max(20000).optional().nullable(),
    profileImageUrl: optionalText,
    profileImageVariants: z.unknown().optional().nullable(),
    isPublic: z.boolean().default(false),
  }).optional().nullable(),
}).superRefine((body, context) => {
  if (!body.guideProfile) return
  const hasLatitude = body.guideProfile.baseLatitude != null
  const hasLongitude = body.guideProfile.baseLongitude != null
  if (hasLatitude !== hasLongitude) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['guideProfile', 'baseLatitude'],
      message: 'La latitude et la longitude doivent être renseignées ensemble.',
    })
  }
})

export type AdminUserInput = z.infer<typeof adminUserSchema>
