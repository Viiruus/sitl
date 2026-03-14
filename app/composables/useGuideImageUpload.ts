import { upload } from '@vercel/blob/client'
import {
  GUIDE_UPLOAD_ALLOWED_MIME,
  GUIDE_UPLOAD_PRESETS,
  buildGuideBlobPath,
  type GuideUploadKind,
} from '~~/shared/constants/guide-image-upload'

type UploadResult = {
  url: string
  variants: []
}

export function validateGuideUploadFile(file: File, kind: GuideUploadKind) {
  if (!GUIDE_UPLOAD_ALLOWED_MIME.includes(file.type as (typeof GUIDE_UPLOAD_ALLOWED_MIME)[number])) {
    return 'Format non supporte. Utilise JPG, PNG ou WebP.'
  }

  if (file.size > GUIDE_UPLOAD_PRESETS[kind].maxUploadBytes) {
    const limitMiB = GUIDE_UPLOAD_PRESETS[kind].maxUploadBytes / (1024 * 1024)
    return `Image trop lourde. Limite: ${limitMiB} Mo.`
  }

  return null
}

export function useGuideImageUpload() {
  const runtimeConfig = useRuntimeConfig()
  const { user, fetch } = useUserSession()

  const ensureUserId = async () => {
    if (!user.value?.id) {
      await fetch()
    }

    const userId = user.value?.id
    if (!userId) {
      throw new Error('Utilisateur introuvable pour le televersement.')
    }

    return userId
  }

  const uploadGuideImage = async (input: {
    file: File
    kind: GuideUploadKind
  }): Promise<UploadResult> => {
    const userId = await ensureUserId()
    const pathname = buildGuideBlobPath({
      userId,
      kind: input.kind,
      filename: input.file.name,
    })

    if (runtimeConfig.public.blobUploadsEnabled) {
      const blob = await upload(pathname, input.file, {
        access: 'public',
        contentType: input.file.type || undefined,
        handleUploadUrl: '/api/moniteurs/blob/upload',
        clientPayload: JSON.stringify({ kind: input.kind }),
        multipart: input.file.size > 4 * 1024 * 1024,
      })

      return {
        url: blob.url,
        variants: [],
      }
    }

    const formData = new FormData()
    formData.append('file', input.file, input.file.name)
    formData.append('kind', input.kind)

    return $fetch<UploadResult>('/api/moniteurs/upload', {
      method: 'POST',
      body: formData,
    })
  }

  return {
    uploadGuideImage,
  }
}
