export type StoredImageVariant = {
  url: string
  width: number
  size?: number
}

const normalizeImageUrl = (src?: string | null) => {
  if (!src) return null
  const value = src.trim()
  if (!value) return null
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  if (value.startsWith('/')) {
    return value
  }
  const cleaned = value.replace(/^(\.\/)+/, '')
  if (cleaned.startsWith('uploads/') || cleaned.startsWith('images/')) {
    return `/${cleaned}`
  }
  return `/images/${cleaned}`
}

export const normalizeStoredVariants = (variants: unknown): StoredImageVariant[] => {
  if (!Array.isArray(variants)) return []
  return variants
    .map((variant: any) => ({
      url: normalizeImageUrl(typeof variant?.url === 'string' ? variant.url : null),
      width: Number(variant?.width),
      size: Number.isFinite(Number(variant?.size)) ? Number(variant?.size) : undefined,
    }))
    .filter((variant) => Boolean(variant.url) && Number.isFinite(variant.width) && variant.width > 0)
    .sort((a, b) => a.width - b.width) as StoredImageVariant[]
}

export const buildStoredSrcset = (variants: unknown): string | undefined => {
  const normalized = normalizeStoredVariants(variants)
  if (!normalized.length) return undefined
  return normalized.map((variant) => `${variant.url} ${variant.width}w`).join(', ')
}

export const resolveStoredImageSrc = (src?: string | null, variants?: unknown): string | null => {
  const normalizedSrc = normalizeImageUrl(src)
  if (normalizedSrc) return normalizedSrc
  const normalizedVariants = normalizeStoredVariants(variants)
  return normalizedVariants.length ? normalizedVariants[normalizedVariants.length - 1].url : null
}
