import { prisma } from '../../../utils/prisma'
import { buildGuideSlug } from '~~/shared/utils/guide-slug'

type VercelAnalyticsRow = {
  requestPath?: string
  pageviews?: number
  visitors?: number
}

const RESERVED_MONITEUR_PATHS = new Set([
  'analytics',
  'aventures',
  'cgu',
  'grimpeurs',
  'login',
  'profil',
])

const formatDateParam = (date: Date) => date.toISOString().slice(0, 10)

const parseDays = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw)

  if (!Number.isFinite(parsed)) return 30
  return Math.min(Math.max(parsed, 1), 90)
}

const normalizeProfilePath = (value: unknown) => {
  if (typeof value !== 'string') return null

  let pathname = value.trim()
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`
  }

  try {
    pathname = new URL(pathname, 'https://www.brigadedukiff.com').pathname
  } catch {
    return null
  }

  const match = pathname.match(/^\/moniteurs\/([^/]+)\/?$/)
  if (!match?.[1]) return null

  let slug = match[1]
  try {
    slug = decodeURIComponent(slug)
  } catch {
    return null
  }

  if (!slug || RESERVED_MONITEUR_PATHS.has(slug)) return null

  return {
    path: `/moniteurs/${slug}`,
    slug,
  }
}

const labelFromSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  if (!session.user.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Finalise ton inscription moniteur avant d’accéder au dashboard.' })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const token = runtimeConfig.vercelAnalyticsToken
  const projectId = runtimeConfig.vercelAnalyticsProjectId
  const teamId = runtimeConfig.vercelAnalyticsTeamId
  const teamSlug = runtimeConfig.vercelAnalyticsTeamSlug

  if (!token || !projectId) {
    return {
      configured: false,
      rankings: [],
      range: null,
      missing: {
        token: !token,
        projectId: !projectId,
      },
    }
  }

  const query = getQuery(event)
  const days = parseDays(query.days)
  const until = new Date()
  const since = new Date(until)
  since.setUTCDate(since.getUTCDate() - (days - 1))

  const params = new URLSearchParams({
    projectId,
    since: formatDateParam(since),
    until: formatDateParam(until),
    by: 'requestPath',
    limit: '200',
    filter: "startswith(requestPath, '/moniteurs/')",
  })

  if (teamId) {
    params.set('teamId', teamId)
  } else if (teamSlug) {
    params.set('teamSlug', teamSlug)
  }

  const response = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/aggregate?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw createError({
      statusCode: response.status,
      statusMessage: body || 'Impossible de récupérer les statistiques Vercel Analytics.',
    })
  }

  const payload = await response.json() as { data?: VercelAnalyticsRow[] }
  const rows = Array.isArray(payload.data) ? payload.data : []

  const db = await prisma()
  const guides = await db.user.findMany({
    where: {
      role: 'GUIDE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })

  const guideBySlug = new Map(
    guides.map((guide) => {
      const firstName = guide.firstName?.trim() || ''
      const lastName = guide.lastName?.trim() || ''
      const slug = buildGuideSlug(firstName, lastName, guide.id)

      return [
        slug,
        {
          id: guide.id,
          fullName: [firstName, lastName].filter(Boolean).join(' ').trim() || labelFromSlug(slug),
        },
      ] as const
    }),
  )

  const profileStatsBySlug = new Map<string, {
    path: string
    slug: string
    pageviews: number
    visitors: number
  }>()

  for (const row of rows) {
    const profilePath = normalizeProfilePath(row.requestPath)
    if (!profilePath) continue

    const current = profileStatsBySlug.get(profilePath.slug) ?? {
      path: profilePath.path,
      slug: profilePath.slug,
      pageviews: 0,
      visitors: 0,
    }

    current.pageviews += Number(row.pageviews ?? 0)
    current.visitors += Number(row.visitors ?? 0)
    profileStatsBySlug.set(profilePath.slug, current)
  }

  const rankings = Array.from(profileStatsBySlug.values())
    .map((stat) => {
      const guide = guideBySlug.get(stat.slug)
      return {
        ...stat,
        guideId: guide?.id ?? null,
        fullName: guide?.fullName ?? labelFromSlug(stat.slug),
        knownGuide: Boolean(guide),
      }
    })
    .sort((a, b) => b.pageviews - a.pageviews || b.visitors - a.visitors || a.fullName.localeCompare(b.fullName))

  return {
    configured: true,
    range: {
      days,
      since: formatDateParam(since),
      until: formatDateParam(until),
    },
    rankings,
  }
})
