import { z } from 'zod'
import { verifyGuideWhatsappOtp } from '../../../../utils/whatsapp-guide-otp'

const bodySchema = z.object({
  phoneNumber: z.string().min(6, 'Numéro requis'),
  token: z.string().min(10, 'Jeton requis'),
  code: z.string().min(4, 'Code requis').max(10),
  source: z.string().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber, code, source, token } = bodySchema.parse(body)

  const result = await verifyGuideWhatsappOtp({
    phoneNumber,
    code,
    token,
    source: source || 'guide',
  })

  await setUserSession(event, {
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      onboarded: result.user.onboarded,
      role: result.user.role,
      isAdmin: result.user.isAdmin,
      phoneNumber: result.user.phoneNumber,
      whatsappOptIn: result.user.whatsappOptIn,
    },
  })

  return { ok: true, requiresOnboarding: result.requiresOnboarding }
})
