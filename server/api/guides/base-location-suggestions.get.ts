import { z } from 'zod'

const querySchema = z.object({
  q: z.string().trim().min(2, 'Renseigne au moins 2 caractères.').max(160),
})

type GeocodingSuggestion = {
  id: string
  label: string
  latitude: number
  longitude: number
}

type CachedSuggestions = {
  expiresAt: number
  suggestions: GeocodingSuggestion[]
}

const cache = new Map<string, CachedSuggestions>()
const cacheTtlMs = 30 * 24 * 60 * 60 * 1000
const minimumRequestIntervalMs = 1_100
let lastRequestAt = 0
let geocodingQueue: Promise<void> = Promise.resolve()

const wait = (duration: number) =>
  new Promise(resolve => setTimeout(resolve, duration))

const scheduleGeocodingRequest = async <T>(request: () => Promise<T>) => {
  const previousRequest = geocodingQueue
  let releaseQueue: () => void = () => {}
  geocodingQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve
  })

  await previousRequest
  try {
    const remainingDelay = minimumRequestIntervalMs - (Date.now() - lastRequestAt)
    if (remainingDelay > 0) await wait(remainingDelay)
    lastRequestAt = Date.now()
    return await request()
  } finally {
    releaseQueue()
  }
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const { q } = querySchema.parse(getQuery(event))
  const cacheKey = q.toLocaleLowerCase('fr').replace(/\s+/g, ' ')
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return {
      suggestions: cached.suggestions,
      attribution: 'Données © contributeurs OpenStreetMap',
    }
  }

  const config = useRuntimeConfig(event)
  const baseUrl = String(config.geocodingBaseUrl).replace(/\/$/, '')

  try {
    const response = await scheduleGeocodingRequest(() =>
      $fetch<any[]>(`${baseUrl}/search`, {
        query: {
          q,
          format: 'jsonv2',
          addressdetails: 1,
          countrycodes: 'fr',
          limit: 5,
        },
        headers: {
          'Accept-Language': 'fr',
          Referer: String(config.public.publicUrl),
          'User-Agent': String(config.geocodingUserAgent),
        },
        timeout: 8_000,
      }),
    )

    const suggestions = response
      .map((result): GeocodingSuggestion | null => {
        const latitude = Number(result?.lat)
        const longitude = Number(result?.lon)
        const label = typeof result?.display_name === 'string'
          ? result.display_name.trim()
          : ''
        if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null
        }
        return {
          id: `${String(result?.osm_type || 'place')}-${String(result?.osm_id || result?.place_id || label)}`,
          label,
          latitude,
          longitude,
        }
      })
      .filter((suggestion): suggestion is GeocodingSuggestion => Boolean(suggestion))

    cache.set(cacheKey, {
      expiresAt: Date.now() + cacheTtlMs,
      suggestions,
    })
    if (cache.size > 250) {
      cache.delete(cache.keys().next().value as string)
    }

    return {
      suggestions,
      attribution: 'Données © contributeurs OpenStreetMap',
    }
  } catch (error: any) {
    console.error('[base-location-geocoding] search failed', {
      query: q,
      statusCode: error?.statusCode || error?.response?.status || null,
      message: error?.message || null,
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'La recherche de lieux est momentanément indisponible.',
    })
  }
})
