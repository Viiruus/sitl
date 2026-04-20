import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { renderSVG } from 'uqr'

const inputPath = '/tmp/brigadedukiff-moniteurs-2026-04-20.json'
const outputDir = '/tmp/brigadedukiff-profile-qrs-2026-04-20'
const baseUrl = 'https://www.brigadedukiff.com'
const qrColor = '#ffcf00'
const width = 1024

const sanitizeFileSegment = (value) =>
  String(value || '')
    .normalize('NFC')
    .replace(/[/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const fileNameForGuide = (guide) => {
  const firstName = sanitizeFileSegment(guide.firstName)
  const lastName = sanitizeFileSegment(guide.lastName)
  return [firstName, lastName].filter(Boolean).join('-') || sanitizeFileSegment(guide.slug) || 'guide'
}

const buildProfileUrl = (slug) => {
  const url = new URL(`/moniteurs/${slug}`, baseUrl)
  url.searchParams.set('source', 'qrcode')
  return url.toString()
}

const main = async () => {
  const raw = await fs.readFile(inputPath, 'utf8')
  const data = JSON.parse(raw)
  const guides = Array.isArray(data.moniteurs) ? data.moniteurs : []

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })

  for (const guide of guides) {
    const profileUrl = buildProfileUrl(guide.slug)
    const svg = renderSVG(profileUrl, {
      ecc: 'M',
      border: 2,
      pixelSize: 24,
      whiteColor: 'transparent',
      blackColor: qrColor,
    })

    const filePath = path.join(outputDir, `${fileNameForGuide(guide)}.png`)
    await sharp(Buffer.from(svg))
      .resize(width, width, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(filePath)
  }

  console.log(`generated=${guides.length}`)
  console.log(`dir=${outputDir}`)
}

await main()
