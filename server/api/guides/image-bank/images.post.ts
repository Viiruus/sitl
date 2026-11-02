import { requireBrigadeImageBankGuide } from '../../../utils/brigade-image-bank-auth'
import { shareBrigadeImageSchema, shareBrigadeImage } from '../../../utils/brigade-image-bank'

export default defineEventHandler(async (event) => {
  const { db, guide } = await requireBrigadeImageBankGuide(event)
  const body = shareBrigadeImageSchema.safeParse(await readBody(event))
  if (!body.success) throw createError({ statusCode: 400, statusMessage: body.error.issues[0]?.message || 'Image ou dossier invalide.' })
  return shareBrigadeImage(db, guide, body.data)
})
