export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // Keep a possible leading "+" and strip formatting noise everywhere else.
  let normalized = trimmed.replace(/[^\d+]/g, '')
  if (normalized.startsWith('00')) {
    normalized = `+${normalized.slice(2)}`
  }

  const hasPlus = normalized.startsWith('+')
  const digits = normalized.replace(/\D/g, '')
  if (!digits) return ''

  // Canonicalise common French inputs:
  // +336..., 336..., 06..., 6... => +336...
  if (digits.startsWith('33') && digits.length === 11) {
    return `+${digits}`
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+33${digits.slice(1)}`
  }
  if (!hasPlus && digits.length === 9) {
    return `+33${digits}`
  }

  return hasPlus ? `+${digits}` : digits
}

export function isValidWhatsAppPhoneNumber(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone)
}

export function normalizeWhatsAppPhoneNumber(raw: string): string {
  const normalized = normalizePhoneNumber(raw)
  return isValidWhatsAppPhoneNumber(normalized) ? normalized : ''
}
