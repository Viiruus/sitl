import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderSVG } from 'uqr'

const inputPath = '/tmp/brigadedukiff-moniteurs-live.json'
const outputDir = '/tmp/brigadedukiff-profile-qrs-2026-04-13'
const baseUrl = 'https://www.brigadedukiff.com'

const data = JSON.parse(readFileSync(inputPath, 'utf8'))
mkdirSync(outputDir, { recursive: true })

const toFileStem = (firstName = '', lastName = '') => {
  const fullName = [firstName, lastName].filter(Boolean).join('-').trim()
  return fullName
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'profil-moniteur'
}

for (const guide of data.moniteurs || []) {
  const stem = toFileStem(guide.firstName, guide.lastName)
  const profileUrl = new URL(`/moniteurs/${guide.slug}`, baseUrl)
  profileUrl.searchParams.set('source', 'qrcode')

  const svg = renderSVG(profileUrl.toString(), {
    ecc: 'M',
    border: 2,
    pixelSize: 8,
    whiteColor: 'transparent',
    blackColor: '#ffcf00',
  })

  writeFileSync(join(outputDir, `${stem}.svg`), svg)
}

console.log(`Generated ${(data.moniteurs || []).length} SVG files in ${outputDir}`)
