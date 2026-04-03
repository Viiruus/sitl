import { normalizePhoneNumber, sendTemplateViaWhatsapp } from './whatsapp-otp'

const GUIDE_NEW_SUBSCRIPTION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_NEW_SUBSCRIPTION_TEMPLATE_NAME || 'new_subscription'
const GUIDE_CLIMBER_STAGE_CANCELATION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_CLIMBER_STAGE_CANCELATION_TEMPLATE_NAME || 'climber_stage_cancelation'
const GUIDE_STAGE_DATE_PROPOSITION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_STAGE_DATE_PROPOSITION_TEMPLATE_NAME || 'stage_date_proposition'
const CLIMBER_SUBSCRIPTION_OK_TEMPLATE_NAME =
  process.env.WHATSAPP_CLIMBER_SUBSCRIPTION_OK_TEMPLATE_NAME || 'subscription_ok'
const BOOKING_TEMPLATE_LANGUAGE = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr'

export const formatBookingStageDate = (start?: string | Date | null, end?: string | Date | null) => {
  if (!start) return ''

  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const startLabel = formatter.format(new Date(start))
  if (!end) return startLabel

  const endLabel = formatter.format(new Date(end))
  return startLabel === endLabel ? startLabel : `${startLabel} → ${endLabel}`
}

export async function sendGuideNewSubscriptionViaWhatsapp(input: {
  phoneNumber: string
  stageTitle: string
  stageLocalization: string
  stageDate: string
  climberFirstName?: string | null
  climberLastName?: string | null
  climberPhoneNumber: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: GUIDE_NEW_SUBSCRIPTION_TEMPLATE_NAME,
    language: BOOKING_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: input.stageTitle,
          },
          {
            type: 'text',
            text: input.stageLocalization,
          },
          {
            type: 'text',
            text: input.stageDate,
          },
          {
            type: 'text',
            text: input.climberFirstName || 'Grimpeur',
          },
          {
            type: 'text',
            text: input.climberLastName || '-',
          },
          {
            type: 'text',
            text: normalizePhoneNumber(input.climberPhoneNumber),
          },
        ],
      },
    ],
    logLabel: 'whatsapp-guide-new-subscription',
  })
}

export async function sendClimberSubscriptionOkViaWhatsapp(input: {
  phoneNumber: string
  stageTitle: string
  stageLocalization: string
  stageDate: string
  stageUrl: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: CLIMBER_SUBSCRIPTION_OK_TEMPLATE_NAME,
    language: BOOKING_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: input.stageTitle,
          },
          {
            type: 'text',
            text: input.stageLocalization,
          },
          {
            type: 'text',
            text: input.stageDate,
          },
          {
            type: 'text',
            text: input.stageUrl,
          },
        ],
      },
    ],
    logLabel: 'whatsapp-climber-subscription-ok',
  })
}

export async function sendGuideClimberStageCancelationViaWhatsapp(input: {
  phoneNumber: string
  stageTitle: string
  stageLocalization: string
  stageDate: string
  climberFirstName?: string | null
  climberLastName?: string | null
  climberPhoneNumber: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: GUIDE_CLIMBER_STAGE_CANCELATION_TEMPLATE_NAME,
    language: BOOKING_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: input.stageTitle,
          },
          {
            type: 'text',
            text: input.stageLocalization,
          },
          {
            type: 'text',
            text: input.stageDate,
          },
          {
            type: 'text',
            text: input.climberFirstName || 'Grimpeur',
          },
          {
            type: 'text',
            text: input.climberLastName || '-',
          },
          {
            type: 'text',
            text: normalizePhoneNumber(input.climberPhoneNumber),
          },
        ],
      },
    ],
    logLabel: 'whatsapp-guide-climber-stage-cancelation',
  })
}

export async function sendGuideStageDatePropositionViaWhatsapp(input: {
  phoneNumber: string
  stageTitle: string
  stageLocalization: string
  climberFirstName?: string | null
  climberLastName?: string | null
  climberPhoneNumber: string
  stageDate: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: GUIDE_STAGE_DATE_PROPOSITION_TEMPLATE_NAME,
    language: BOOKING_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: input.stageTitle,
          },
          {
            type: 'text',
            text: input.stageLocalization,
          },
          {
            type: 'text',
            text: input.climberFirstName || 'Grimpeur',
          },
          {
            type: 'text',
            text: input.climberLastName || '-',
          },
          {
            type: 'text',
            text: normalizePhoneNumber(input.climberPhoneNumber),
          },
          {
            type: 'text',
            text: input.stageDate,
          },
        ],
      },
    ],
    logLabel: 'whatsapp-guide-stage-date-proposition',
  })
}
