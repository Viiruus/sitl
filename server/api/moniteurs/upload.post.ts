import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { join } from 'pathe'
import { readMultipartFormData } from 'h3'
import sharp from 'sharp'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MEBIBYTE = 1024 * 1024
const VARIANT_QUALITY_DELTA = 8

type UploadKind = 'profile' | 'cover' | 'gallery'

type UploadPreset = {
  maxUploadBytes: number
  maxWidth: number
  maxHeight: number
  quality: number
  variantWidths: number[]
}

const PRESETS: Record<UploadKind, UploadPreset> = {
  profile: {
    maxUploadBytes: 3 * MEBIBYTE,
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
}

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV)
const PUBLIC_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'moniteurs')

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Réservé aux moniteurs' })
  }

  const form = await readMultipartFormData(event)
  if (!form || !form.length) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun fichier fourni' })
  }

  const filePart = form.find((item) => item.name === 'file' && item.filename && item.data)
    ?? form.find((item) => item.filename && item.data)
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier invalide' })
  }

  if (filePart.type && !ALLOWED_MIME.includes(filePart.type)) {
    throw createError({ statusCode: 415, statusMessage: 'Format non supporté' })
  }

  const kind = parseUploadKind(
    form.find((item) => item.name === 'kind')?.data?.toString('utf8').trim().toLowerCase(),
  )
  const preset = PRESETS[kind]
  const sourceBuffer = Buffer.from(filePart.data)

  if (sourceBuffer.byteLength > preset.maxUploadBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Image trop lourde (max ${formatMiB(preset.maxUploadBytes)} Mo).`,
    })
  }

  const optimized = await optimizeImage(sourceBuffer, preset)

  // On Vercel, return a compressed data URL because filesystem persistence is not guaranteed.
  if (isVercel) {
    const base64 = optimized.buffer.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64}`
    return {
      url: dataUrl,
      kind,
      width: optimized.width,
      height: optimized.height,
      size: optimized.buffer.byteLength,
      variants: [],
    }
  }

  const targetDir = PUBLIC_UPLOAD_DIR
  await fs.mkdir(targetDir, { recursive: true })

  const basename = `${session.user.id}-${randomUUID()}`
  const canonicalFilename = `${basename}.webp`
  const canonicalPath = join(targetDir, canonicalFilename)
  await fs.writeFile(canonicalPath, optimized.buffer)

  const variants = await generateVariants({
    buffer: optimized.buffer,
    baseName: basename,
    targetDir,
    quality: preset.quality,
    widths: preset.variantWidths,
    maxWidth: optimized.width,
  })

  return {
    url: `/uploads/moniteurs/${canonicalFilename}`,
    kind,
    width: optimized.width,
    height: optimized.height,
    size: optimized.buffer.byteLength,
    variants,
  }
})

const parseUploadKind = (value?: string): UploadKind => {
  if (value === 'profile' || value === 'cover' || value === 'gallery') {
    return value
  }
  return 'gallery'
}

const formatMiB = (bytes: number) => {
  return (bytes / MEBIBYTE).toFixed(0)
}

const optimizeImage = async (source: Buffer, preset: UploadPreset) => {
  try {
    const { data, info } = await sharp(source)
      .rotate()
      .resize({
        width: preset.maxWidth,
        height: preset.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: preset.quality, effort: 5 })
      .toBuffer({ resolveWithObject: true })

    return {
      buffer: data,
      width: info.width || preset.maxWidth,
      height: info.height || preset.maxHeight,
    }
  } catch {
    throw createError({ statusCode: 415, statusMessage: 'Image invalide ou corrompue.' })
  }
}

const generateVariants = async (input: {
  buffer: Buffer
  baseName: string
  targetDir: string
  widths: number[]
  quality: number
  maxWidth: number
}) => {
  const widths = input.widths
    .filter((width) => width < input.maxWidth)
    .sort((a, b) => a - b)
  const quality = Math.max(58, input.quality - VARIANT_QUALITY_DELTA)

  const variants: { width: number; url: string; size: number }[] = []
  for (const width of widths) {
    const filename = `${input.baseName}-${width}w.webp`
    const filepath = join(input.targetDir, filename)
    const output = await sharp(input.buffer)
      .resize({ width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer()
    await fs.writeFile(filepath, output)
    variants.push({
      width,
      url: `/uploads/moniteurs/${filename}`,
      size: output.byteLength,
    })
  }

  return variants
}
