const DEFAULT_SITE_URL = 'https://www.brigadedukiff.com'

export const resolvePublicSiteUrl = (value?: string | null) => {
  const raw = typeof value === 'string' ? value.trim() : ''

  if (!raw) {
    return DEFAULT_SITE_URL
  }

  try {
    const url = new URL(raw)
    const hostname = url.hostname.toLowerCase()
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0'

    if (process.env.NODE_ENV === 'production' && isLocalHost) {
      return DEFAULT_SITE_URL
    }

    return url.toString().replace(/\/$/, '')
  } catch {
    return DEFAULT_SITE_URL
  }
}
