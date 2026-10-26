import { partnerBenefits } from '../../data/partner-benefits'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE' || !session.user.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs inscrits' })
  }

  return { partners: partnerBenefits }
})
