import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('normalize-image-paths: missing TURSO_DATABASE_URL/DATABASE_URL')
  process.exit(1)
}

const client = createClient({ url, authToken: token })

const isAbsolute = (value: string) =>
  /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')

const normalizeUrlValue = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (isAbsolute(trimmed) || trimmed.startsWith('/')) return trimmed

  const cleaned = trimmed.replace(/^(\.\/)+/, '')
  if (cleaned.startsWith('uploads/') || cleaned.startsWith('images/')) {
    return `/${cleaned}`
  }
  return trimmed
}

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

const normalizeVariants = (value: unknown): { changed: boolean; value: unknown } => {
  const parsed = parseJsonMaybe(value)
  if (!Array.isArray(parsed)) return { changed: false, value: parsed }

  let changed = false
  const next = parsed.map((variant: any) => {
    if (!variant || typeof variant !== 'object') return variant
    const nextUrl = normalizeUrlValue(variant.url)
    if (!nextUrl || nextUrl === variant.url) return variant
    changed = true
    return { ...variant, url: nextUrl }
  })

  return { changed, value: next }
}

async function normalizeGuideProfile() {
  const rows = await client.execute(`SELECT "id", "profileImageUrl", "profileImageVariants" FROM "GuideProfile"`)
  let updated = 0

  for (const row of rows.rows as any[]) {
    const nextUrl = normalizeUrlValue(row.profileImageUrl)
    const variants = normalizeVariants(row.profileImageVariants)
    const urlChanged = typeof nextUrl === 'string' && nextUrl !== row.profileImageUrl

    if (!urlChanged && !variants.changed) continue

    await client.execute({
      sql: `UPDATE "GuideProfile" SET "profileImageUrl" = :url, "profileImageVariants" = :variants WHERE "id" = :id`,
      args: {
        id: row.id,
        url: nextUrl ?? row.profileImageUrl,
        variants: JSON.stringify(variants.value),
      },
    })
    updated += 1
  }

  return updated
}

async function normalizeAventure() {
  const rows = await client.execute(`SELECT "id", "coverImageUrl", "coverImageVariants" FROM "Aventure"`)
  let updated = 0

  for (const row of rows.rows as any[]) {
    const nextUrl = normalizeUrlValue(row.coverImageUrl)
    const variants = normalizeVariants(row.coverImageVariants)
    const urlChanged = typeof nextUrl === 'string' && nextUrl !== row.coverImageUrl

    if (!urlChanged && !variants.changed) continue

    await client.execute({
      sql: `UPDATE "Aventure" SET "coverImageUrl" = :url, "coverImageVariants" = :variants WHERE "id" = :id`,
      args: {
        id: row.id,
        url: nextUrl ?? row.coverImageUrl,
        variants: JSON.stringify(variants.value),
      },
    })
    updated += 1
  }

  return updated
}

async function normalizeAventureImage() {
  const rows = await client.execute(`SELECT "id", "url", "variants" FROM "AventureImage"`)
  let updated = 0

  for (const row of rows.rows as any[]) {
    const nextUrl = normalizeUrlValue(row.url)
    const variants = normalizeVariants(row.variants)
    const urlChanged = typeof nextUrl === 'string' && nextUrl !== row.url

    if (!urlChanged && !variants.changed) continue

    await client.execute({
      sql: `UPDATE "AventureImage" SET "url" = :url, "variants" = :variants WHERE "id" = :id`,
      args: {
        id: row.id,
        url: nextUrl ?? row.url,
        variants: JSON.stringify(variants.value),
      },
    })
    updated += 1
  }

  return updated
}

async function main() {
  const guideUpdates = await normalizeGuideProfile()
  const aventureUpdates = await normalizeAventure()
  const imageUpdates = await normalizeAventureImage()

  console.log(
    JSON.stringify(
      {
        guideProfilesUpdated: guideUpdates,
        aventuresUpdated: aventureUpdates,
        aventureImagesUpdated: imageUpdates,
        totalUpdated: guideUpdates + aventureUpdates + imageUpdates,
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error('normalize-image-paths: failed', error)
    process.exit(1)
  })
  .finally(() => {
    client.close()
  })
