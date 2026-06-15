import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@libsql/client'
import sharp from 'sharp'
import { renderSVG } from 'uqr'

const envPath = path.resolve('.env.production.local')
const outputDir = path.resolve('.tmp/brigadedukiff-production-guide-qrs-2026-06-03')
const baseUrl = 'https://www.brigadedukiff.com'
const qrColor = '#ffcf00'
const width = 1024

const parseEnvFile = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8')
  const entries = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    const value = rawValue.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    entries[key] = value
  }

  return entries
}

const sanitizeFileSegment = (value) =>
  String(value || '')
    .normalize('NFC')
    .replace(/[/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const buildGuideSlug = (firstName, lastName, fallback) => {
  const base = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (!base) return fallback ? String(fallback) : ''

  return base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

const fileNameForGuide = (guide) => {
  const name = [guide.firstName, guide.lastName].map(sanitizeFileSegment).filter(Boolean).join('-')
  return name || sanitizeFileSegment(guide.slug) || `guide-${guide.id}`
}

const buildProfileUrl = (slug) => {
  const url = new URL(`/moniteurs/${slug}`, baseUrl)
  url.searchParams.set('source', 'qrcode')
  return url.toString()
}

const isPublicComplete = (guide) =>
  Boolean(
    guide.firstName?.trim() &&
      guide.lastName?.trim() &&
      guide.profileImageUrl?.trim() &&
      guide.bio?.trim() &&
      (guide.baseLocation?.trim() || guide.department?.trim()),
  )

const main = async () => {
  const env = await parseEnvFile(envPath)
  const url = env.TURSO_DATABASE_URL || env.LIBSQL_URL
  const authToken = env.TURSO_AUTH_TOKEN || env.LIBSQL_AUTH_TOKEN

  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL/TURSO_AUTH_TOKEN manquants dans .env.production.local')
  }

  const client = createClient({ url, authToken })
  const result = await client.execute(`
    SELECT
      User.id,
      User.firstName,
      User.lastName,
      User.department,
      GuideProfile.bio,
      GuideProfile.baseLocation,
      GuideProfile.profileImageUrl
    FROM User
    LEFT JOIN GuideProfile ON GuideProfile.userId = User.id
    WHERE User.role = 'GUIDE'
    ORDER BY User.firstName COLLATE NOCASE ASC, User.lastName COLLATE NOCASE ASC, User.id ASC
  `)

  const guides = result.rows.map((row) => {
    const guide = {
      id: Number(row.id),
      firstName: typeof row.firstName === 'string' ? row.firstName.trim() : '',
      lastName: typeof row.lastName === 'string' ? row.lastName.trim() : '',
      department: typeof row.department === 'string' ? row.department.trim() : '',
      bio: typeof row.bio === 'string' ? row.bio.trim() : '',
      baseLocation: typeof row.baseLocation === 'string' ? row.baseLocation.trim() : '',
      profileImageUrl: typeof row.profileImageUrl === 'string' ? row.profileImageUrl.trim() : '',
    }

    return {
      ...guide,
      slug: buildGuideSlug(guide.firstName, guide.lastName, guide.id),
    }
  })

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })

  const manifest = []

  for (const guide of guides) {
    const profileUrl = buildProfileUrl(guide.slug)
    const fileName = `${fileNameForGuide(guide)}.png`
    const filePath = path.join(outputDir, fileName)
    const svg = renderSVG(profileUrl, {
      ecc: 'M',
      border: 2,
      pixelSize: 24,
      whiteColor: 'transparent',
      blackColor: qrColor,
    })

    await sharp(Buffer.from(svg))
      .resize(width, width, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(filePath)

    manifest.push({
      id: guide.id,
      firstName: guide.firstName || null,
      lastName: guide.lastName || null,
      fullName: [guide.firstName, guide.lastName].filter(Boolean).join(' ') || null,
      slug: guide.slug,
      url: profileUrl,
      file: fileName,
      publicComplete: isPublicComplete(guide),
    })
  }

  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, count: manifest.length, guides: manifest }, null, 2)}\n`,
    'utf8',
  )

  console.log(`generated=${manifest.length}`)
  console.log(`publicComplete=${manifest.filter((guide) => guide.publicComplete).length}`)
  console.log(`dir=${outputDir}`)
}

await main()
