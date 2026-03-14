import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import {
  GUIDE_UPLOAD_ALLOWED_MIME,
  GUIDE_UPLOAD_PRESETS,
  parseGuideUploadKind,
} from '../../../../shared/constants/guide-image-upload'

type ClientPayload = {
  kind?: string
}

const GENERATE_TOKEN_EVENT = 'blob.generate-client-token'

const parseClientPayload = (value: string | null): ClientPayload => {
  if (!value) return {}

  try {
    return JSON.parse(value)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Payload de televersement invalide.' })
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<HandleUploadBody>(event)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (!blobToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Vercel Blob n’est pas configure sur cet environnement.',
    })
  }

  if (body.type === GENERATE_TOKEN_EVENT) {
    const session = await getUserSession(event)
    if (!session?.user?.id) {
      throw createError({ statusCode: 401, statusMessage: 'Non authentifie' })
    }
    if (session.user.role !== 'GUIDE') {
      throw createError({ statusCode: 403, statusMessage: 'Reserve aux moniteurs' })
    }
  }

  try {
    return await handleUpload({
      token: blobToken,
      request: event.node.req,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getUserSession(event)
        if (!session?.user?.id || session.user.role !== 'GUIDE') {
          throw new Error('Unauthorized')
        }

        const parsedPayload = parseClientPayload(clientPayload)
        const kind = parseGuideUploadKind(parsedPayload.kind)
        const preset = GUIDE_UPLOAD_PRESETS[kind]
        const expectedPrefix = `guides/${session.user.id}/${kind}/`

        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error('Invalid upload pathname')
        }

        return {
          allowedContentTypes: [...GUIDE_UPLOAD_ALLOWED_MIME],
          maximumSizeInBytes: preset.maxUploadBytes,
          addRandomSuffix: true,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            kind,
          }),
        }
      },
      onUploadCompleted: async () => {
        return
      },
    })
  } catch (error: any) {
    const message = String(error?.message || error)

    if (message.includes('Unauthorized')) {
      throw createError({ statusCode: 401, statusMessage: 'Non authentifie' })
    }

    if (message.includes('Invalid upload pathname')) {
      throw createError({ statusCode: 400, statusMessage: 'Chemin de televersement invalide.' })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de preparer le televersement Vercel Blob.',
    })
  }
})
