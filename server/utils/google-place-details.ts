type GooglePlaceReview = {
  authorName: string | null
  rating: number | null
  relativeTime: string | null
  text: string
}

type GooglePlaceSummary = {
  url: string | null
  rating: number | null
  reviewCount: number | null
  reviews: GooglePlaceReview[]
}

const googlePlaceCache = new Map<string, { expiresAt: number; value: GooglePlaceSummary | null }>()
const GOOGLE_PLACE_CACHE_TTL_MS = 1000 * 60 * 30

const asNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

export const extractGooglePlaceId = (input?: string | null) => {
  const value = asNonEmptyString(input)
  if (!value) return null

  try {
    const url = new URL(value)
    const queryPlaceId = asNonEmptyString(url.searchParams.get('query_place_id'))
    if (queryPlaceId) return queryPlaceId

    const q = asNonEmptyString(url.searchParams.get('q'))
    if (q?.startsWith('place_id:')) {
      return q.slice('place_id:'.length).trim() || null
    }
  } catch {
    // Fall through and try raw patterns below.
  }

  const placeIdMatch = value.match(/place_id:([A-Za-z0-9_-]+)/i) || value.match(/query_place_id=([A-Za-z0-9_-]+)/i)
  return placeIdMatch?.[1] || null
}

export const fetchGooglePlaceSummary = async ({
  apiKey,
  placeId,
  fallbackUrl,
}: {
  apiKey?: string | null
  placeId?: string | null
  fallbackUrl?: string | null
}): Promise<GooglePlaceSummary | null> => {
  const normalizedPlaceId = asNonEmptyString(placeId)
  const normalizedApiKey = asNonEmptyString(apiKey)
  const normalizedFallbackUrl = asNonEmptyString(fallbackUrl)

  if (!normalizedPlaceId || !normalizedApiKey) {
    return normalizedFallbackUrl
      ? {
          url: normalizedFallbackUrl,
          rating: null,
          reviewCount: null,
          reviews: [],
        }
      : null
  }

  const cacheKey = `${normalizedPlaceId}:${normalizedFallbackUrl || ''}`
  const cached = googlePlaceCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  try {
    const response = await $fetch<any>(`https://places.googleapis.com/v1/places/${encodeURIComponent(normalizedPlaceId)}`, {
      headers: {
        'X-Goog-Api-Key': normalizedApiKey,
        'X-Goog-FieldMask': 'id,googleMapsUri,rating,userRatingCount,reviews',
      },
    })

    const reviews = Array.isArray(response?.reviews)
      ? response.reviews
          .map((review: any) => {
            const text = asNonEmptyString(review?.text?.text) || asNonEmptyString(review?.originalText?.text)
            if (!text) return null
            return {
              authorName: asNonEmptyString(review?.authorAttribution?.displayName),
              rating: typeof review?.rating === 'number' ? review.rating : null,
              relativeTime: asNonEmptyString(review?.relativePublishTimeDescription),
              text,
            }
          })
          .filter(Boolean)
          .slice(0, 3) as GooglePlaceReview[]
      : []

    const value: GooglePlaceSummary = {
      url: asNonEmptyString(response?.googleMapsUri) || normalizedFallbackUrl,
      rating: typeof response?.rating === 'number' ? response.rating : null,
      reviewCount: typeof response?.userRatingCount === 'number' ? response.userRatingCount : null,
      reviews,
    }

    googlePlaceCache.set(cacheKey, {
      expiresAt: Date.now() + GOOGLE_PLACE_CACHE_TTL_MS,
      value,
    })

    return value
  } catch (error) {
    console.error('Failed to fetch Google Place summary', {
      placeId: normalizedPlaceId,
      error,
    })

    const value = normalizedFallbackUrl
      ? {
          url: normalizedFallbackUrl,
          rating: null,
          reviewCount: null,
          reviews: [],
        }
      : null

    googlePlaceCache.set(cacheKey, {
      expiresAt: Date.now() + GOOGLE_PLACE_CACHE_TTL_MS,
      value,
    })

    return value
  }
}
