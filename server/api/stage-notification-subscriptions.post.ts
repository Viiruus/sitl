import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { assertClimberOnboardingComplete } from '../utils/climber-onboarding'
import { normalizePhoneNumber } from '../utils/whatsapp-otp'
import { normalizeStageNotificationDateRange } from '../utils/stage-notifications'
import { STAGE_REGION_BOUNDS } from '~~/shared/utils/stage-region'

const bodySchema = z.object({
  kind: z.enum(['STAGE_LISTING', 'GUIDE_STAGE']).default('STAGE_LISTING'),
  discipline: z.enum(['FALAISE', 'GRANDE_VOIE', 'BLOC', 'TRAD', 'VIA_FERRATA']).nullable().optional(),
  region: z.string().trim().min(1).nullable().optional(),
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  guideId: z.number().int().positive().nullable().optional(),
})

const nullableTime = (value?: Date | null) => value?.getTime() ?? null

const sameNullableDate = (left?: Date | null, right?: Date | null) =>
  nullableTime(left) === nullableTime(right)

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Connecte-toi pour recevoir ces notifications.',
    })
  }
  if (session.user.role && session.user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Les notifications de stages sont réservées aux comptes grimpeurs.',
    })
  }

  const body = bodySchema.parse(await readBody(event))
  const db = await prisma()
  const userId = Number(session.user.id)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      whatsappOptIn: true,
      onboarded: true,
    },
  })

  if (!user || user.role !== 'CLIMBER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Les notifications de stages sont réservées aux comptes grimpeurs.',
    })
  }

  await assertClimberOnboardingComplete(db, user)

  const normalizedPhone = normalizePhoneNumber(user.phoneNumber || '')
  if (!normalizedPhone || !user.whatsappOptIn) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Ajoute un numéro WhatsApp à ton compte pour recevoir ces notifications.',
    })
  }

  const region = body.region || null
  if (region && !STAGE_REGION_BOUNDS.some((entry) => entry.value === region)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Région invalide.',
    })
  }

  if (body.kind === 'GUIDE_STAGE' && !body.guideId) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Moniteur manquant pour cette notification.',
    })
  }
  if (body.kind === 'GUIDE_STAGE' && body.guideId) {
    const guide = await db.user.findFirst({
      where: {
        id: body.guideId,
        role: 'GUIDE',
      },
      select: { id: true },
    })
    if (!guide) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Moniteur introuvable.',
      })
    }
  }

  const { dateStart, dateEnd } = normalizeStageNotificationDateRange({
    dateStart: body.dateStart || null,
    dateEnd: body.dateEnd || null,
  })

  const criteria = body.kind === 'GUIDE_STAGE'
    ? {
        discipline: null,
        region: null,
        dateStart: null,
        dateEnd: null,
        guideId: body.guideId ?? null,
      }
    : {
        discipline: body.discipline || null,
        region,
        dateStart,
        dateEnd,
        guideId: null,
      }

  const activeSubscriptions = await db.stageNotificationSubscription.findMany({
    where: {
      userId,
      kind: body.kind,
      active: true,
    },
  })

  const existing = activeSubscriptions.find((subscription: any) =>
    (subscription.discipline ?? null) === criteria.discipline &&
    (subscription.region ?? null) === criteria.region &&
    sameNullableDate(subscription.dateStart, criteria.dateStart) &&
    sameNullableDate(subscription.dateEnd, criteria.dateEnd) &&
    (subscription.guideId ?? null) === criteria.guideId,
  )

  if (existing) {
    return { subscription: existing, already: true }
  }

  const subscription = await db.stageNotificationSubscription.create({
    data: {
      userId,
      kind: body.kind,
      ...criteria,
    },
  })

  return { subscription, already: false }
})
