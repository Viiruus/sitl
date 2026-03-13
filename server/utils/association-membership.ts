import { getAssociationMembershipOffer } from '../../shared/constants/association-membership'

type MembershipRole = 'CLIMBER' | 'GUIDE' | 'ADMIN'

export async function recordAssociationMembership(
  db: any,
  input: {
    userId: number
    role: MembershipRole
    source: string
    accepted: boolean | undefined
  },
) {
  if (!input.accepted) return null

  const offer = getAssociationMembershipOffer()

  return db.associationMembership.upsert({
    where: {
      userId_membershipYear: {
        userId: input.userId,
        membershipYear: offer.year,
      },
    },
    create: {
      userId: input.userId,
      membershipYear: offer.year,
      amountCents: offer.amountCents,
      currency: offer.currency,
      roleSnapshot: input.role,
      source: input.source,
      acceptedAt: new Date(),
    },
    update: {
      amountCents: offer.amountCents,
      currency: offer.currency,
      roleSnapshot: input.role,
      source: input.source,
      acceptedAt: new Date(),
    },
  })
}
