import { formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { normalizePhoneNumber } from '~~/shared/utils/phone-number'
import { getStageRegionForCoordinates } from '~~/shared/utils/stage-region'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'
import { sendTemplateViaWhatsapp } from './whatsapp-otp'

export const STAGE_LISTING_NOTIFICATION_TEMPLATE_NAME =
  process.env.WHATSAPP_STAGE_LISTING_NOTIFICATION_TEMPLATE_NAME || 'notifications_new_stage'
export const GUIDE_STAGE_NOTIFICATION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_STAGE_NOTIFICATION_TEMPLATE_NAME || 'notifications_new_stage_guide'
const NOTIFICATION_TEMPLATE_LANGUAGE = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr'

const buildNamedTextParameter = (parameterName: string, text: string) => ({
  type: 'text',
  parameter_name: parameterName,
  text,
})

const normalizeDateStart = (value?: string | null) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00.000`)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeDateEnd = (value?: string | null) => {
  if (!value) return null
  const date = new Date(`${value}T23:59:59.999`)
  return Number.isNaN(date.getTime()) ? null : date
}

export const normalizeStageNotificationDateRange = (input: {
  dateStart?: string | null
  dateEnd?: string | null
}) => {
  const dateStart = normalizeDateStart(input.dateStart)
  const dateEnd = normalizeDateEnd(input.dateEnd)

  if (dateStart && dateEnd && dateStart > dateEnd) {
    throw createError({
      statusCode: 422,
      statusMessage: 'La date de début doit être avant la date de fin.',
    })
  }

  return { dateStart, dateEnd }
}

const sessionOverlapsDateRange = (
  session: { dateDebut?: Date | string | null; dateFin?: Date | string | null },
  range: { dateStart?: Date | null; dateEnd?: Date | null },
) => {
  if (!range.dateStart && !range.dateEnd) return true
  if (!session.dateDebut) return false

  const sessionStart = new Date(session.dateDebut)
  const sessionEnd = session.dateFin ? new Date(session.dateFin) : sessionStart
  if (Number.isNaN(sessionStart.getTime()) || Number.isNaN(sessionEnd.getTime())) return false

  if (range.dateStart && sessionEnd < range.dateStart) return false
  if (range.dateEnd && sessionStart > range.dateEnd) return false
  return true
}

const getUpcomingSessions = (sessions: any[]) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return sessions
    .filter((session) => session?.statut !== 'ANNULE')
    .filter((session) => {
      if (!session?.dateDebut) return false
      const time = new Date(session.dateDebut).getTime()
      return !Number.isNaN(time) && time >= today.getTime()
    })
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
}

const firstMatchingSessionLabel = (
  sessions: any[],
  range: { dateStart?: Date | null; dateEnd?: Date | null },
) => {
  const matchingSession = getUpcomingSessions(sessions).find((session) =>
    sessionOverlapsDateRange(session, range),
  )
  return formatSessionRangeLabel(matchingSession?.dateDebut, matchingSession?.dateFin) || 'Date à confirmer'
}

const subscriptionMatchesAventure = (subscription: any, aventure: any, sessions: any[]) => {
  const upcomingSessions = getUpcomingSessions(sessions)
  if (!upcomingSessions.length) return false

  if (subscription.kind === 'GUIDE_STAGE') {
    return subscription.guideId === aventure.guideId
  }

  if (subscription.discipline && subscription.discipline !== aventure.discipline) {
    return false
  }

  if (subscription.region) {
    const region = getStageRegionForCoordinates(aventure.latitude, aventure.longitude)
    if (region?.value !== subscription.region) return false
  }

  return upcomingSessions.some((session) =>
    sessionOverlapsDateRange(session, {
      dateStart: subscription.dateStart,
      dateEnd: subscription.dateEnd,
    }),
  )
}

export async function sendStageListingNotificationViaWhatsapp(input: {
  phoneNumber: string
  stageTitle: string
  stageLocalization: string
  stageDate: string
  stageUrl: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: STAGE_LISTING_NOTIFICATION_TEMPLATE_NAME,
    language: NOTIFICATION_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          buildNamedTextParameter('stage_title', input.stageTitle),
          buildNamedTextParameter('stage_localization', input.stageLocalization),
          buildNamedTextParameter('stage_date', input.stageDate),
          buildNamedTextParameter('stage_url', input.stageUrl),
        ],
      },
    ],
    logLabel: 'whatsapp-stage-listing-notification',
  })
}

export async function sendGuideStageNotificationViaWhatsapp(input: {
  phoneNumber: string
  guideName: string
  stageTitle: string
  stageLocalization: string
  stageDate: string
  stageUrl: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: GUIDE_STAGE_NOTIFICATION_TEMPLATE_NAME,
    language: NOTIFICATION_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          buildNamedTextParameter('guide_name', input.guideName),
          buildNamedTextParameter('stage_title', input.stageTitle),
          buildNamedTextParameter('stage_localization', input.stageLocalization),
          buildNamedTextParameter('stage_date', input.stageDate),
          buildNamedTextParameter('stage_url', input.stageUrl),
        ],
      },
    ],
    logLabel: 'whatsapp-guide-stage-notification',
  })
}

export async function notifyStageNotificationSubscribers(input: {
  db: any
  aventureId: number
  sessionId?: number | null
  publicUrl?: string | null
}) {
  const { db, aventureId, sessionId = null } = input
  const aventure = await db.aventure.findUnique({
    where: { id: aventureId },
    include: {
      guide: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      sessions: true,
    },
  })

  if (!aventure?.estPublie) return { notified: 0 }

  const candidateSessions = sessionId
    ? (aventure.sessions ?? []).filter((session: any) => session.id === sessionId)
    : (aventure.sessions ?? [])

  if (!candidateSessions.length) return { notified: 0 }

  const subscriptions = await db.stageNotificationSubscription.findMany({
    where: {
      active: true,
      OR: [
        { kind: 'STAGE_LISTING' },
        { kind: 'GUIDE_STAGE', guideId: aventure.guideId },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          phoneNumber: true,
          whatsappOptIn: true,
          role: true,
        },
      },
    },
  })

  const baseUrl = resolvePublicSiteUrl(input.publicUrl)
  const stageUrl = (() => {
    try {
      return new URL(`/stages-escalade/${aventure.slug}`, baseUrl).toString()
    } catch {
      return `/stages-escalade/${aventure.slug}`
    }
  })()
  const guideName = [aventure.guide?.firstName, aventure.guide?.lastName].filter(Boolean).join(' ') || 'Ton moniteur'
  let notified = 0

  await Promise.allSettled(
    subscriptions
      .filter((subscription: any) => subscription.user?.role === 'CLIMBER')
      .filter((subscription: any) => subscriptionMatchesAventure(subscription, aventure, candidateSessions))
      .map(async (subscription: any) => {
        const deliveryKey = sessionId
          ? `session:${subscription.id}:${sessionId}`
          : `publish:${subscription.id}:${aventure.id}`
        const existingDelivery = await db.stageNotificationDelivery.findUnique({
          where: { deliveryKey },
        })
        if (existingDelivery) return

        const phoneNumber = normalizePhoneNumber(subscription.user?.phoneNumber || '')
        const templateName =
          subscription.kind === 'GUIDE_STAGE'
            ? GUIDE_STAGE_NOTIFICATION_TEMPLATE_NAME
            : STAGE_LISTING_NOTIFICATION_TEMPLATE_NAME
        const commonPayload = {
          stageTitle: aventure.titre,
          stageLocalization: aventure.lieuLabel || 'Lieu à confirmer',
          stageDate: firstMatchingSessionLabel(candidateSessions, {
            dateStart: subscription.dateStart,
            dateEnd: subscription.dateEnd,
          }),
          stageUrl,
        }

        if (!phoneNumber || !subscription.user?.whatsappOptIn) {
          await db.stageNotificationDelivery.create({
            data: {
              subscriptionId: subscription.id,
              aventureId: aventure.id,
              sessionId,
              deliveryKey,
              status: 'SKIPPED',
              templateName,
              failureReason: 'missing_whatsapp_opt_in_or_phone',
            },
          })
          return
        }

        const result =
          subscription.kind === 'GUIDE_STAGE'
            ? await sendGuideStageNotificationViaWhatsapp({
                phoneNumber,
                guideName,
                ...commonPayload,
              })
            : await sendStageListingNotificationViaWhatsapp({
                phoneNumber,
                ...commonPayload,
              })

        await db.stageNotificationDelivery.create({
          data: {
            subscriptionId: subscription.id,
            aventureId: aventure.id,
            sessionId,
            deliveryKey,
            status: result.ok ? 'SENT' : 'FAILED',
            templateName,
            messageId: result.ok ? result.messageId : null,
            failureReason: result.ok ? null : result.message,
            sentAt: result.ok ? new Date() : null,
            lastPayload: result.raw ?? null,
          },
        })

        if (result.ok) {
          notified += 1
          await db.stageNotificationSubscription.update({
            where: { id: subscription.id },
            data: { lastNotifiedAt: new Date() },
          })
        } else {
          console.error('[stage-notifications] WhatsApp send failed', {
            subscriptionId: subscription.id,
            aventureId: aventure.id,
            userId: subscription.user?.id,
            templateName,
            reason: result.reason,
            statusCode: result.statusCode,
            raw: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw),
          })
        }
      }),
  )

  return { notified }
}
