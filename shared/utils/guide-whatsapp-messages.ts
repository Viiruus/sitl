export const GUIDE_WHATSAPP_MESSAGE_KINDS = [
  'WELCOME', 'NEW_SUBSCRIPTION', 'CANCELLATION', 'DATE_SUGGESTION', 'CONTACT_REQUEST',
] as const

export type GuideWhatsAppMessageKind = typeof GUIDE_WHATSAPP_MESSAGE_KINDS[number]

export const GUIDE_WHATSAPP_KIND_LABELS: Record<GuideWhatsAppMessageKind, string> = {
  WELCOME: 'Bienvenue',
  NEW_SUBSCRIPTION: 'Nouvelle inscription',
  CANCELLATION: 'Annulation d’inscription',
  DATE_SUGGESTION: 'Suggestion de dates',
  CONTACT_REQUEST: 'Demande particulière',
}

export const GUIDE_WHATSAPP_STATUS_LABELS = {
  pending: 'En attente d’envoi',
  accepted: 'Accepté par WhatsApp',
  sent: 'Envoyé',
  delivered: 'Distribué',
  read: 'Lu',
  failed: 'Échec d’envoi',
} as const

const parameterLabels: Record<string, string> = {
  stage_title: 'Stage',
  stage_localization: 'Lieu',
  stage_date: 'Dates',
  firstname: 'Prénom',
  lastname: 'Nom',
  whatsapp_number: 'Téléphone du grimpeur',
  phone_number: 'Téléphone du grimpeur',
}

const positionalLabels: Partial<Record<GuideWhatsAppMessageKind, string[]>> = {
  CONTACT_REQUEST: ['Grimpeur', 'Téléphone du grimpeur', 'Message'],
  DATE_SUGGESTION: ['Stage', 'Lieu', 'Prénom', 'Nom', 'Téléphone du grimpeur', 'Dates'],
}

// Seuls les paramètres réellement transmis sont affichés : le texte fixe
// des modèles est géré par WhatsApp et n’est pas conservé par l’application.
export function getGuideWhatsAppMessageDetails(kind: GuideWhatsAppMessageKind, components: unknown) {
  if (!Array.isArray(components)) return []
  return components.flatMap((component) => {
    if (!['body', 'header'].includes(component?.type) || !Array.isArray(component.parameters)) return []
    return component.parameters.flatMap((parameter: any, index: number) => {
      if (parameter?.type !== 'text' || typeof parameter.text !== 'string') return []
      return [{
        label: parameterLabels[parameter.parameter_name]
          || positionalLabels[kind]?.[index]
          || `Information ${index + 1}`,
        value: parameter.text,
      }]
    })
  })
}

export type AdminGuideWhatsAppMessage = {
  id: number
  guideId: number | null
  guideName: string
  phoneNumber: string
  kind: GuideWhatsAppMessageKind
  templateName: string
  language: string
  status: string
  messageId: string | null
  failureReason: string | null
  createdAt: string
  sentAt: string | null
  details: { label: string; value: string }[]
  fullContactMessage: string | null
}
