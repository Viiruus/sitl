export type PublicImageVariant = {
  url: string
  width: number
  size?: number
}

const ABSOLUTE_URL_RE = /^(https?:)?\/\//i

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

export const isInlineImageUrl = (value: unknown): boolean => {
  const trimmed = toTrimmedString(value)
  if (!trimmed) return false
  return trimmed.toLowerCase().startsWith('data:')
}

const isBlobImageUrl = (value: unknown): boolean => {
  const trimmed = toTrimmedString(value)
  if (!trimmed) return false
  return trimmed.toLowerCase().startsWith('blob:')
}

export const sanitizePublicImageUrl = (value: unknown): string | null => {
  const trimmed = toTrimmedString(value)
  if (!trimmed) return null
  if (isInlineImageUrl(trimmed) || isBlobImageUrl(trimmed)) return null

  if (ABSOLUTE_URL_RE.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed

  const cleaned = trimmed.replace(/^(\.\/)+/, '')
  if (!cleaned) return null
  if (
    cleaned.startsWith('uploads/') ||
    cleaned.startsWith('images/') ||
    cleaned.startsWith('api/moniteurs/uploads/')
  ) {
    return `/${cleaned}`
  }

  return `/images/${cleaned}`
}

export const sanitizePublicImageVariants = (value: unknown): PublicImageVariant[] | null => {
  if (!Array.isArray(value)) return null

  const variants = value
    .map((entry: any) => {
      const url = sanitizePublicImageUrl(entry?.url)
      const width = Number(entry?.width)
      if (!url || !Number.isFinite(width) || width <= 0) return null
      const sizeNumber = Number(entry?.size)
      const variant: PublicImageVariant = {
        url,
        width,
      }
      if (Number.isFinite(sizeNumber) && sizeNumber >= 0) {
        variant.size = sizeNumber
      }
      return variant
    })
    .filter((entry): entry is PublicImageVariant => Boolean(entry))
    .sort((a, b) => a.width - b.width)

  return variants.length ? variants : null
}
