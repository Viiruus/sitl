// server/api/onboarding.post.ts
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { recordAssociationMembership } from '../utils/association-membership'
import { sendTemplateViaWhatsapp } from '../utils/whatsapp-otp'

// Schéma de validation/typage des données reçues du front
const onboardingSchema = z.object({
  // Infos perso
  firstName: z.string().trim().min(1).optional().or(z.literal('')),
  lastName: z.string().trim().min(1).optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')), // string simple
  department: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().trim().max(30).optional().or(z.literal('')),
  cguAccepted: z
    .literal(true, {
      errorMap: () => ({ message: 'Merci de valider les CGU.' }),
    })
    .optional(),
  associationMembershipAccepted: z.literal(true, {
    errorMap: () => ({ message: "Merci de valider l'adhésion à l'association." }),
  }),
  whatsappOptIn: z.boolean().optional(),

  // Pratique
  typesOfClimbing: z.array(z.string()).optional().default([]),
  climbsMainly: z.enum(['lead', 'toprope']).optional().or(z.literal('')),

  environments: z.array(z.string()).optional().default([]),
  autonomy: z.array(z.string()).optional().default([]),

  frequency: z
    .enum(['moins_1', '1', '2_3', 'plus_3'])
    .optional()
    .or(z.literal('')),

  // Niveau
  gradeLevel: z
    .enum(['sub_5a', '5a_5c', '6a_6c', '7_plus', 'dont_know'])
    .optional()
    .or(z.literal('')),

  preferredClimbingStyle: z
    .enum(['devers', 'vertical', 'dalle'])
    .optional()
    .or(z.literal('')),

  climbingGoal: z.string().trim().max(500).optional().or(z.literal('')),

  boulderingLocations: z.array(z.string()).optional().default([]),

  boulderingGrade: z
    .enum(['jaune', 'vert', 'bleu', 'rouge', 'noir', 'violet'])
    .optional()
    .or(z.literal('')),

  belayDevices: z.array(z.string()).optional().default([]),

  multiAutonomy: z.array(z.string()).optional().default([]),
  tradProtections: z.array(z.string()).optional().default([]),
  tradMovingBelay: z.enum(['oui', 'non']).optional().or(z.literal('')),

  // Vision du voyage
  tripStyles: z.array(z.string()).optional().default([]),
})

export default defineEventHandler(async (event) => {
  const db = await prisma()
  // 1) Vérifier qu'on a bien un utilisateur connecté
  const session = await getUserSession(event) // auto-import nuxt-auth-utils

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
    })
  }
  if (session.user.role === 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Réservé aux grimpeurs.',
    })
  }

  const currentUser = await db.user.findUnique({
    where: { id: Number(session.user.id) },
  })
  if (!currentUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  }
  if (currentUser.role === 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Réservé aux grimpeurs.' })
  }

  // 2) Lire et valider le body
  const rawBody = await readBody(event)
  const body = onboardingSchema.parse(rawBody)

  // 4) Mettre à jour l'utilisateur en BDD
  const user = await db.user.update({
    where: { id: Number(session.user.id) }, // au cas où l'id soit sérialisé en string
    data: {
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      birthDate: body.birthDate || null,
      department: body.department || null,
      phoneNumber: body.phoneNumber?.trim?.() || currentUser.phoneNumber,
      whatsappOptIn: body.whatsappOptIn ?? currentUser.whatsappOptIn ?? false,

      typesOfClimbing: body.typesOfClimbing ?? [],
      climbsMainly: body.climbsMainly || null,
      environments: body.environments ?? [],
      autonomy: body.autonomy ?? [],
      frequency: body.frequency || null,

      gradeLevel: body.gradeLevel || null,
      preferredClimbingStyle: body.preferredClimbingStyle || null,
      climbingGoal: body.climbingGoal || null,
      boulderingLocations: body.boulderingLocations ?? [],
      boulderingGrade: body.boulderingGrade || null,
      belayDevices: body.belayDevices ?? [],
      multiAutonomy: body.multiAutonomy ?? [],
      tradProtections: body.tradProtections ?? [],
      tradMovingBelay: body.tradMovingBelay || null,
      tripStyles: body.tripStyles ?? [],
      onboarded: true,
      onboardingStep: 2,
    },
  })

  await recordAssociationMembership(db, {
    userId: user.id,
    role: 'CLIMBER',
    source: 'climber-onboarding',
    accepted: body.associationMembershipAccepted,
  })

  if (user.phoneNumber && user.whatsappOptIn) {
    const climberFirstName = user.firstName || body.firstName?.trim?.() || 'grimpeur'

    const result = await sendTemplateViaWhatsapp({
      phone: user.phoneNumber,
      templateName: process.env.WHATSAPP_CLIMBER_WELCOME_TEMPLATE_NAME || 'welcome_climber',
      language: process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr',
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'text',
              parameter_name: 'firstname',
              text: climberFirstName,
            },
          ],
        },
      ],
      logLabel: 'whatsapp-climber-welcome',
    })

    if (!result.ok) {
      console.error('[whatsapp-climber-welcome] Non-blocking send failure', {
        climberId: user.id,
        phoneNumber: user.phoneNumber,
        reason: result.reason,
        statusCode: result.statusCode,
        raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
      })
    }
  }

  // 5) Mettre à jour la session (pour que user.onboarded soit à jour côté front)
  await setUserSession(event, {
    user: {
      ...session.user,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
      role: session.user.role ?? user.role,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return { ok: true }
})
