// Les trois journées du Salon, du 15 au 17 janvier 2027 inclus, heure de Paris (UTC+1).
export const SALON_ESCALADE_2027 = {
  startsAt: '2027-01-14T23:00:00.000Z',
  endsAt: '2027-01-17T23:00:00.000Z',
  discountPercent: 20,
  label: 'Salon de l’Escalade 2027',
} as const

export type SalonOfferPhase = 'upcoming' | 'active' | 'ended'
export type SalonBookingOffer = Pick<typeof SALON_ESCALADE_2027, 'label' | 'discountPercent'>

export function getSalonOfferPhase(date: Date | string | number): SalonOfferPhase {
  const timestamp = new Date(date).getTime()
  if (!Number.isFinite(timestamp)) return 'ended'
  if (timestamp < Date.parse(SALON_ESCALADE_2027.startsAt)) return 'upcoming'
  if (timestamp < Date.parse(SALON_ESCALADE_2027.endsAt)) return 'active'
  return 'ended'
}

export function getSalonBookingOffer(createdAt: Date | string): SalonBookingOffer | null {
  // createdAt est conservé en base et n'est pas modifiable dans l'administration.
  // L'avantage reste donc identifiable après le Salon, sans dépendre de la date du stage
  // ni de la date de consultation. Une réinscription après annulation crée une nouvelle réservation.
  if (getSalonOfferPhase(createdAt) !== 'active') return null
  return {
    label: SALON_ESCALADE_2027.label,
    discountPercent: SALON_ESCALADE_2027.discountPercent,
  }
}
