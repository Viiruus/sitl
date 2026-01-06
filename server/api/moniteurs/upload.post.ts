import { extname } from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { join } from 'pathe'
import { readMultipartFormData } from 'h3'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV)
const PUBLIC_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'moniteurs')
const TMP_UPLOAD_DIR = join('/tmp', 'uploads', 'moniteurs')

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

  const filePart = form.find((item) => item.filename && item.data)
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier invalide' })
  }

  if (filePart.type && !ALLOWED_MIME.includes(filePart.type)) {
    throw createError({ statusCode: 415, statusMessage: 'Format non supporté' })
  }

  const targetDir = isVercel ? TMP_UPLOAD_DIR : PUBLIC_UPLOAD_DIR
  await fs.mkdir(targetDir, { recursive: true })
  const extension = filePart.type ? extname(filePart.filename || '').toLowerCase() || guessExtension(filePart.type) : ''
  const filename = `${session.user.id}-${randomUUID()}${extension || '.jpg'}`
  const filepath = join(targetDir, filename)
  await fs.writeFile(filepath, filePart.data)

  const publicPath = isVercel
    ? `/api/moniteurs/uploads/${filename}`
    : `/uploads/moniteurs/${filename}`
  return { url: publicPath }
})

const guessExtension = (mime: string) => {
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  return '.jpg'
}
