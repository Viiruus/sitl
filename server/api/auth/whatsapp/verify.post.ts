import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { normalizePhoneNumber, verifyOtpToken } from '../../../utils/whatsapp-otp'

const bodySchema = z.object({
  phoneNumber: z.string().min(6, 'Numéro requis'),
  token: z.string().min(10, 'Jeton requis'),
  code: z.string().min(4, 'Code requis').max(10),
  source: z.string().max(50).optional(),
})

function derivedEmailFromPhone(phone: string) {
  const cleaned = phone.replace(/[^a-zA-Z0-9]/g, '')
  return `wa-${cleaned || 'user'}@whatsapp.local`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber, code, source, token } = bodySchema.parse(body)

  const normalized = normalizePhoneNumber(phoneNumber)
  if (!normalized || normalized.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro de téléphone invalide.' })
  }

  const verification = verifyOtpToken(token, code)
  if (!verification.ok) {
    const messages: Record<string, string> = {
      invalid_token: 'Jeton invalide. Renvoie un nouveau code.',
      expired: 'Le code a expiré, renvoie un nouveau code.',
      invalid_code: 'Code incorrect.',
    }
    throw createError({
      statusCode: 400,
      statusMessage: messages[verification.reason] || 'Code invalide.',
    })
  }

  // Le token contient le numéro officiel validé
  const verifiedPhone = normalizePhoneNumber(verification.phone)
  if (verifiedPhone !== normalized) {
    throw createError({ statusCode: 400, statusMessage: 'Numéro différent de la demande initiale.' })
  }

  const db = await prisma()

  // Rechercher un compte existant par numéro
  let user = await db.user.findFirst({
    where: { phoneNumber: normalized },
  })

  // Si le compte existe mais n'est pas un grimpeur, on refuse
  if (user && user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce numéro est associé à un compte moniteur. Utilise la connexion guide.',
    })
  }

  // Créer un compte si nécessaire
  if (!user) {
    const email = derivedEmailFromPhone(normalized)
    user = await db.user.create({
      data: {
        email,
        passwordHash: null,
        phoneNumber: verifiedPhone,
        whatsappOptIn: true,
        acquisitionSource: verification.source || source || null,
        onboarded: false,
        onboardingStep: 0,
        role: 'CLIMBER',
      },
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
      role: user.role,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return { ok: true }
})
