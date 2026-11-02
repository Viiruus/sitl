import { requireBrigadeImageBankGuide } from '../../../utils/brigade-image-bank-auth'
import { listBrigadeImageFolders } from '../../../utils/brigade-image-bank'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { db } = await requireBrigadeImageBankGuide(event)
  return listBrigadeImageFolders(db)
})
