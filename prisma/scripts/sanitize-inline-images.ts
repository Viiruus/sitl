import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('sanitize-inline-images: missing TURSO_DATABASE_URL/DATABASE_URL')
  process.exit(1)
}

const client = createClient({ url, authToken: token })

const ABSOLUTE_URL_RE = /^(https?:)?\/\//i

const parseJsonMaybe = (value: unknown) => {
  if (value == null) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return value
}

const isInlineOrBlob = (value: string) => {
  const lower = value.toLowerCase()
  return lower.startsWith('data:') || lower.startsWith('blob:')
}

const sanitizeUrlValue = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (isInlineOrBlob(trimmed)) return null
  if (ABSOLUTE_URL_RE.test(trimmed) || trimmed.startsWith('/')) return trimmed

  const cleaned = trimmed.replace(/^(\.\/)+/, '')
  if (!cleaned) return null
  if (
    cleaned.startsWith('uploads/') ||
    cleaned.startsWith('images/') ||
    cleaned.startsWith('api/moniteurs/uploads/')
  ) {
    return `/${cleaned}`
  }

  return trimmed
}

const sanitizeVariants = (value: unknown): { changed: boolean; value: unknown; droppedInline: number } => {
  const parsed = parseJsonMaybe(value)
  if (!Array.isArray(parsed)) return { changed: false, value: parsed, droppedInline: 0 }

  let changed = false
  let droppedInline = 0
  const next = parsed
    .map((variant: any) => {
      if (!variant || typeof variant !== 'object') return null
      const safeUrl = sanitizeUrlValue(variant.url)
      const width = Number(variant.width)
      const size = Number(variant.size)

      if (!safeUrl || !Number.isFinite(width) || width <= 0) {
        changed = true
        if (typeof variant.url === 'string' && isInlineOrBlob(variant.url.trim())) {
          droppedInline += 1
        }
        return null
      }

      const nextVariant: Record<string, unknown> = {
        ...variant,
        url: safeUrl,
        width,
      }
      if (Number.isFinite(size) && size >= 0) {
        nextVariant.size = size
      } else {
        delete nextVariant.size
      }
      if (nextVariant.url !== variant.url || nextVariant.width !== variant.width || nextVariant.size !== variant.size) {
        changed = true
      }
      return nextVariant
    })
    .filter(Boolean)

  return { changed, value: next.length ? next : null, droppedInline }
}

async function sanitizeGuideProfiles() {
  const rows = await client.execute('SELECT "id", "profileImageUrl", "profileImageVariants" FROM "GuideProfile"')
  let updated = 0
  let inlineUrlsRemoved = 0
  let inlineVariantsRemoved = 0

  for (const row of rows.rows as any[]) {
    const currentUrl = typeof row.profileImageUrl === 'string' ? row.profileImageUrl : null
    const nextUrl = sanitizeUrlValue(currentUrl)
    const urlChanged = nextUrl !== currentUrl
    if (currentUrl && !nextUrl && isInlineOrBlob(currentUrl.trim())) {
      inlineUrlsRemoved += 1
    }

    const variants = sanitizeVariants(row.profileImageVariants)
    inlineVariantsRemoved += variants.droppedInline

    if (!urlChanged && !variants.changed) continue

    await client.execute({
      sql: 'UPDATE "GuideProfile" SET "profileImageUrl" = :url, "profileImageVariants" = :variants WHERE "id" = :id',
      args: {
        id: row.id,
        url: nextUrl,
        variants: JSON.stringify(variants.value),
      },
    })
    updated += 1
  }

  return { updated, inlineUrlsRemoved, inlineVariantsRemoved }
}

async function sanitizeAventures() {
  const rows = await client.execute('SELECT "id", "coverImageUrl", "coverImageVariants" FROM "Aventure"')
  let updated = 0
  let inlineUrlsRemoved = 0
  let inlineVariantsRemoved = 0

  for (const row of rows.rows as any[]) {
    const currentUrl = typeof row.coverImageUrl === 'string' ? row.coverImageUrl : null
    const nextUrl = sanitizeUrlValue(currentUrl)
    const urlChanged = nextUrl !== currentUrl
    if (currentUrl && !nextUrl && isInlineOrBlob(currentUrl.trim())) {
      inlineUrlsRemoved += 1
    }

    const variants = sanitizeVariants(row.coverImageVariants)
    inlineVariantsRemoved += variants.droppedInline

    if (!urlChanged && !variants.changed) continue

    await client.execute({
      sql: 'UPDATE "Aventure" SET "coverImageUrl" = :url, "coverImageVariants" = :variants WHERE "id" = :id',
      args: {
        id: row.id,
        url: nextUrl,
        variants: JSON.stringify(variants.value),
      },
    })
    updated += 1
  }

  return { updated, inlineUrlsRemoved, inlineVariantsRemoved }
}

async function sanitizeAventureImagesVariantsOnly() {
  const rows = await client.execute('SELECT "id", "variants" FROM "AventureImage"')
  let updated = 0
  let inlineVariantsRemoved = 0

  for (const row of rows.rows as any[]) {
    const variants = sanitizeVariants(row.variants)
    inlineVariantsRemoved += variants.droppedInline
    if (!variants.changed) continue

    await client.execute({
      sql: 'UPDATE "AventureImage" SET "variants" = :variants WHERE "id" = :id',
      args: {
        id: row.id,
        variants: JSON.stringify(variants.value),
      },
    })
    updated += 1
  }

  return { updated, inlineVariantsRemoved }
}

async function main() {
  const guideProfiles = await sanitizeGuideProfiles()
  const aventures = await sanitizeAventures()
  const aventureImages = await sanitizeAventureImagesVariantsOnly()

  const summary = {
    guideProfiles,
    aventures,
    aventureImages,
    totalRowsUpdated: guideProfiles.updated + aventures.updated + aventureImages.updated,
    totalInlineUrlsRemoved: guideProfiles.inlineUrlsRemoved + aventures.inlineUrlsRemoved,
    totalInlineVariantsRemoved:
      guideProfiles.inlineVariantsRemoved + aventures.inlineVariantsRemoved + aventureImages.inlineVariantsRemoved,
  }

  console.log(JSON.stringify(summary, null, 2))
}

main()
  .catch((error) => {
    console.error('sanitize-inline-images: failed', error)
    process.exit(1)
  })
  .finally(() => {
    client.close()
  })
