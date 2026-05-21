import { getAssociationMembershipOffer } from '../../shared/constants/association-membership'

type ClimberOnboardingUser = {
  id: number
  role?: string | null
  onboarded?: boolean | null
  firstName?: string | null
  lastName?: string | null
}

export const incompleteClimberOnboardingMessage =
  "Finalise ton inscription grimpeur avant de continuer : prénom, nom, CGU et adhésion à l'association sont obligatoires."

export function hasRequiredClimberIdentity(user: ClimberOnboardingUser | null | undefined) {
  if (!user || user.role === 'GUIDE' || user.onboarded !== true) return false
  return Boolean(user.firstName?.trim()) && Boolean(user.lastName?.trim())
}

export async function hasCurrentAssociationMembership(db: any, userId: number) {
  const offer = getAssociationMembershipOffer()
  const membership = await db.associationMembership.findUnique({
    where: {
      userId_membershipYear: {
        userId,
        membershipYear: offer.year,
      },
    },
    select: { id: true },
  })

  return Boolean(membership)
}

export async function isClimberOnboardingComplete(
  db: any,
  user: ClimberOnboardingUser | null | undefined,
) {
  if (!hasRequiredClimberIdentity(user)) return false
  return hasCurrentAssociationMembership(db, user.id)
}

export async function assertClimberOnboardingComplete(
  db: any,
  user: ClimberOnboardingUser | null | undefined,
) {
  if (await isClimberOnboardingComplete(db, user)) return

  throw createError({
    statusCode: 428,
    statusMessage: incompleteClimberOnboardingMessage,
    data: { message: incompleteClimberOnboardingMessage },
  })
}
