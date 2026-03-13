export const associationDocuments = {
  statutesUrl: '/legal/statuts-association-bdk.pdf',
  internalRulesUrl: '/legal/reglement-interieur-bdk.pdf',
} as const

function formatEuroAmount(amountCents: number) {
  if (amountCents % 100 === 0) {
    return `${amountCents / 100}€`
  }

  return `${(amountCents / 100).toFixed(2).replace('.', ',')}€`
}

export function getAssociationMembershipOffer(date = new Date()) {
  const year = date.getFullYear()
  const amountCents = 0

  return {
    year,
    amountCents,
    currency: 'EUR' as const,
    amountLabel: formatEuroAmount(amountCents),
    ...associationDocuments,
  }
}
