import { requireBrigadeImageBankGuide } from '../../../utils/brigade-image-bank-auth'
import { brigadeImageQuerySchema, listBrigadeImages } from '../../../utils/brigade-image-bank'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { db } = await requireBrigadeImageBankGuide(event)
  const query = brigadeImageQuerySchema.safeParse(getQuery(event))
  if (!query.success) throw createError({ statusCode: 400, statusMessage: 'Filtres invalides.' })
  return listBrigadeImages(db, query.data)
})
