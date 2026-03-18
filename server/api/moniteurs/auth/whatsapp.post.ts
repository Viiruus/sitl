import { z } from 'zod'
import { requestGuideWhatsappOtp } from '../../../utils/whatsapp-guide-otp'

const bodySchema = z.object({
  phoneNumber: z.string().min(6, 'Numéro requis'),
  source: z.string().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber, source } = bodySchema.parse(body)
  return requestGuideWhatsappOtp({
    phoneNumber,
    source: source || 'guide',
  })
})
