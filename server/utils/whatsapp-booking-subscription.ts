import { formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { normalizePhoneNumber } from '~~/shared/utils/phone-number'
import { sendTemplateViaWhatsapp } from './whatsapp-otp'

const GUIDE_NEW_SUBSCRIPTION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_NEW_SUBSCRIPTION_TEMPLATE_NAME || 'new_subscription'
const GUIDE_CLIMBER_STAGE_CANCELATION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_CLIMBER_STAGE_CANCELATION_TEMPLATE_NAME || 'climber_stage_cancelation'
const GUIDE_STAGE_DATE_PROPOSITION_TEMPLATE_NAME =
  process.env.WHATSAPP_GUIDE_STAGE_DATE_PROPOSITION_TEMPLATE_NAME || 'stage_date_proposition'
const CLIMBER_SUBSCRIPTION_OK_TEMPLATE_NAME =
  process.env.WHATSAPP_CLIMBER_SUBSCRIPTION_OK_TEMPLATE_NAME || 'subscription_ok'
const BOOKING_TEMPLATE_LANGUAGE = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'fr'

const buildNamedTextParameter = (parameterName: string, text: string) => ({
  type: 'text',
  parameter_name: parameterName,
  text,
})

export const formatBookingStageDate = (start?: string | Date | null, end?: string | Date | null) =>
  formatSessionRangeLabel(start, end)

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
          buildNamedTextParameter('stage_title', input.stageTitle),
          buildNamedTextParameter('stage_localization', input.stageLocalization),
          buildNamedTextParameter('stage_date', input.stageDate),
          buildNamedTextParameter('firstname', input.climberFirstName || 'Grimpeur'),
          buildNamedTextParameter('lastname', input.climberLastName || '-'),
          buildNamedTextParameter('whatsapp_number', normalizePhoneNumber(input.climberPhoneNumber)),
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
  stageUrlPath: string
}) {
  return sendTemplateViaWhatsapp({
    phone: normalizePhoneNumber(input.phoneNumber),
    templateName: CLIMBER_SUBSCRIPTION_OK_TEMPLATE_NAME,
    language: BOOKING_TEMPLATE_LANGUAGE,
    components: [
      {
        type: 'body',
        parameters: [
          buildNamedTextParameter('stage_title', input.stageTitle),
          buildNamedTextParameter('stage_localization', input.stageLocalization),
          buildNamedTextParameter('stage_date', input.stageDate),
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [
          {
            type: 'text',
            text: input.stageUrlPath,
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
          buildNamedTextParameter('stage_title', input.stageTitle),
          buildNamedTextParameter('stage_localization', input.stageLocalization),
          buildNamedTextParameter('stage_date', input.stageDate),
          buildNamedTextParameter('firstname', input.climberFirstName || 'Grimpeur'),
          buildNamedTextParameter('lastname', input.climberLastName || '-'),
          buildNamedTextParameter('phone_number', normalizePhoneNumber(input.climberPhoneNumber)),
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
