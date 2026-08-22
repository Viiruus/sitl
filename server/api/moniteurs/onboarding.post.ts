import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { recordAssociationMembership } from '../../utils/association-membership'
import { sendTemplateViaWhatsapp } from '../../utils/whatsapp-otp'

const bodySchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  cguAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Merci de valider les CGU.' }),
  }),
  associationMembershipAccepted: z.literal(true, {
    errorMap: () => ({ message: "Merci de valider l'adhésion à l'association." }),
  }),
})

const createValidationError = (message: string) =>
  createError({
    statusCode: 400,
    statusMessage: message,
    data: { message },
  })

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const parsedBody = bodySchema.safeParse(await readBody(event))
  if (!parsedBody.success) {
    throw createValidationError(parsedBody.error.issues[0]?.message || 'Données invalides.')
  }
  const body = parsedBody.data
  const db = await prisma()

  const user = await db.user.update({
    where: { id: Number(session.user.id) },
    data: {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      onboarded: true,
      onboardingStep: 1,
    },
  })

  await recordAssociationMembership(db, {
    userId: user.id,
    role: 'GUIDE',
    source: 'guide-onboarding',
    accepted: body.associationMembershipAccepted,
  })

  if (user.phoneNumber && user.whatsappOptIn) {
    const result = await sendTemplateViaWhatsapp({
      phone: user.phoneNumber,
      templateName: process.env.WHATSAPP_GUIDE_WELCOME_TEMPLATE_NAME || 'welcome_guide',
      language: process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr',
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'text',
              parameter_name: 'firstname',
              text: user.firstName || body.firstName.trim(),
            },
          ],
        },
      ],
      logLabel: 'whatsapp-guide-welcome',
    })

    if (!result.ok) {
      console.error('[whatsapp-guide-welcome] Non-blocking send failure', {
        guideId: user.id,
        phoneNumber: user.phoneNumber,
        reason: result.reason,
        statusCode: result.statusCode,
        raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
      })
    }
  }

  await setUserSession(event, {
    user: {
      ...session.user,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
      role: user.role,
      isAdmin: user.isAdmin,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return { ok: true }
})
