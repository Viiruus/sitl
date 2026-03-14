export type GuideUploadKind = 'profile' | 'cover' | 'gallery'

const MEBIBYTE = 1024 * 1024

export const GUIDE_UPLOAD_ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const

export const GUIDE_UPLOAD_PRESETS = {
  profile: {
    maxUploadBytes: 4 * MEBIBYTE,
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 78,
    variantWidths: [96, 192, 384, 768],
  },
  cover: {
    maxUploadBytes: 5 * MEBIBYTE,
    maxWidth: 1920,
    maxHeight: 1280,
    quality: 76,
    variantWidths: [640, 960, 1280, 1600, 1920],
  },
  gallery: {
    maxUploadBytes: 5 * MEBIBYTE,
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 74,
    variantWidths: [480, 768, 1024, 1280, 1600],
  },
} as const satisfies Record<
  GuideUploadKind,
  {
    maxUploadBytes: number
    maxWidth: number
    maxHeight: number
    quality: number
    variantWidths: number[]
  }
>

export function parseGuideUploadKind(value?: string | null): GuideUploadKind {
  if (value === 'profile' || value === 'cover' || value === 'gallery') {
    return value
  }
  return 'gallery'
}

export function sanitizeGuideUploadFilename(filename: string) {
  const normalized = filename
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  const dotIndex = normalized.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === normalized.length - 1) {
    return normalized || 'image'
  }

  const basename = normalized.slice(0, dotIndex) || 'image'
  const extension = normalized.slice(dotIndex + 1).toLowerCase()
  return `${basename}.${extension}`
}

export function buildGuideBlobPath(input: {
  userId: number | string
  kind: GuideUploadKind
  filename: string
}) {
  const safeFilename = sanitizeGuideUploadFilename(input.filename)
  return `guides/${input.userId}/${input.kind}/${safeFilename}`
}

export function isManagedGuideImageUrl(value?: string | null) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/moniteurs/uploads/')) return true

  try {
    const url = new URL(trimmed)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}
