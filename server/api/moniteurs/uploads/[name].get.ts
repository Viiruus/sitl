import { promises as fs } from 'node:fs'
import { join, extname } from 'node:path'

const TMP_UPLOAD_DIR = join('/tmp', 'uploads', 'moniteurs')
const PUBLIC_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'moniteurs')

const mimeFromExt = (ext: string) => {
  const lower = ext.toLowerCase()
  if (lower === '.png') return 'image/png'
  if (lower === '.webp') return 'image/webp'
  return 'image/jpeg'
}

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier manquant' })
  }

  // Try tmp first (Vercel), then public
  const paths = [
    join(TMP_UPLOAD_DIR, name),
    join(PUBLIC_UPLOAD_DIR, name),
  ]

  for (const path of paths) {
    try {
      const data = await fs.readFile(path)
      const type = mimeFromExt(extname(name) || '.jpg')
      event.node.res.setHeader('Content-Type', type)
      return data
    } catch (err: any) {
      if (err?.code !== 'ENOENT') {
        throw createError({ statusCode: 500, statusMessage: 'Erreur lecture fichier' })
      }
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable' })
})
