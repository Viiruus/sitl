import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { head } from '@vercel/blob'

// Les images proposées au partage doivent provenir d’un téléversement du
// moniteur connecté, jamais d’une URL externe ou d’un autre moniteur.
export function ownedBrigadeUploadPath(url: string, guideId: number) {
  const local = url.match(/^\/uploads\/moniteurs\/([0-9]+-[0-9a-f-]{36}(?:-[0-9]+w)?\.webp)$/i)
  if (local) return local[1].startsWith(`${guideId}-`) ? { kind: 'local' as const, pathname: local[1] } : null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(parsed.hostname)) return null
    if (parsed.search || parsed.hash || parsed.username || parsed.password || parsed.port) return null
    if (!new RegExp(`^/guides/${guideId}/(cover|gallery)/[a-z0-9._-]+\\.(webp|png|jpe?g)$`, 'i').test(parsed.pathname)) return null
    return { kind: 'blob' as const, pathname: parsed.pathname.slice(1) }
  } catch {
    return null
  }
}

export async function verifyBrigadeUploads(guideId: number, urls: string[]) {
  await Promise.all(urls.map(async (url) => {
    const owned = ownedBrigadeUploadPath(url, guideId)
    if (!owned) throw createError({ statusCode: 403, statusMessage: 'Tu peux partager uniquement les images que tu as téléversées.' })
    try {
      if (owned.kind === 'local') {
        if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) throw new Error('Local upload unavailable')
        const file = await stat(join(process.cwd(), 'public', 'uploads', 'moniteurs', owned.pathname))
        if (!file.isFile() || !file.size) throw new Error('Invalid upload')
      } else {
        const token = process.env.BLOB_READ_WRITE_TOKEN
        if (!token) throw new Error('Blob unavailable')
        const blob = await head(url, { token })
        if (blob.pathname !== owned.pathname || !['image/webp', 'image/png', 'image/jpeg'].includes(blob.contentType)) throw new Error('Invalid upload')
      }
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Cette image n’est plus disponible. Téléverse-la à nouveau avant de la partager.' })
    }
  }))
}
