import { upload } from '@vercel/blob/client'
import {
  GUIDE_UPLOAD_ALLOWED_MIME,
  GUIDE_UPLOAD_PRESETS,
  buildGuideBlobPath,
  sanitizeGuideUploadFilename,
  type GuideUploadKind,
} from '~~/shared/constants/guide-image-upload'

type UploadVariant = {
  url: string
  width: number
  size?: number
}

type UploadResult = {
  url: string
  variants: UploadVariant[]
}

type PreparedUploadAsset = {
  file: File
  width: number
  size: number
}

const VARIANT_QUALITY_DELTA = 8

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

const normalizeFileBaseName = (filename: string) => {
  const safeFilename = sanitizeGuideUploadFilename(filename)
  const dotIndex = safeFilename.lastIndexOf('.')
  if (dotIndex <= 0) return safeFilename || 'image'
  return safeFilename.slice(0, dotIndex) || 'image'
}

const blobToFile = (blob: Blob, filename: string) => {
  return new File([blob], filename, {
    type: blob.type || 'image/webp',
    lastModified: Date.now(),
  })
}

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Impossible de preparer l’image.'))
          return
        }
        resolve(blob)
      },
      'image/webp',
      quality,
    )
  })

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image invalide ou corrompue.'))
    }
    image.src = objectUrl
  })

const fitInside = (width: number, height: number, maxWidth: number, maxHeight: number) => {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

const renderWebpAsset = async (input: {
  source: CanvasImageSource
  sourceWidth: number
  sourceHeight: number
  targetWidth: number
  targetHeight: number
  filename: string
  quality: number
}): Promise<PreparedUploadAsset> => {
  const canvas = document.createElement('canvas')
  canvas.width = input.targetWidth
  canvas.height = input.targetHeight

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Impossible de preparer l’image.')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.clearRect(0, 0, input.targetWidth, input.targetHeight)
  context.drawImage(input.source, 0, 0, input.sourceWidth, input.sourceHeight, 0, 0, input.targetWidth, input.targetHeight)

  const blob = await canvasToBlob(canvas, input.quality)
  return {
    file: blobToFile(blob, input.filename),
    width: input.targetWidth,
    size: blob.size,
  }
}

const prepareBlobUploadAssets = async (file: File, kind: GuideUploadKind) => {
  const preset = GUIDE_UPLOAD_PRESETS[kind]
  const image = await loadImage(file)
  const baseName = normalizeFileBaseName(file.name)
  const quality = preset.quality / 100
  const variantQuality = Math.max(0.58, (preset.quality - VARIANT_QUALITY_DELTA) / 100)
  const fitted = fitInside(image.naturalWidth, image.naturalHeight, preset.maxWidth, preset.maxHeight)

  const canonical = await renderWebpAsset({
    source: image,
    sourceWidth: image.naturalWidth,
    sourceHeight: image.naturalHeight,
    targetWidth: fitted.width,
    targetHeight: fitted.height,
    filename: `${baseName}.webp`,
    quality,
  })

  const variants = (
    await Promise.all(
      preset.variantWidths
        .filter((width) => width < canonical.width)
        .map((width) =>
          renderWebpAsset({
            source: image,
            sourceWidth: image.naturalWidth,
            sourceHeight: image.naturalHeight,
            targetWidth: width,
            targetHeight: Math.max(1, Math.round((image.naturalHeight * width) / image.naturalWidth)),
            filename: `${baseName}-${width}w.webp`,
            quality: variantQuality,
          }),
        ),
    )
  ).sort((a, b) => a.width - b.width)

  return {
    canonical,
    variants,
  }
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

    if (runtimeConfig.public.blobUploadsEnabled) {
      const prepared = await prepareBlobUploadAssets(input.file, input.kind)

      const blob = await upload(buildGuideBlobPath({
        userId,
        kind: input.kind,
        filename: prepared.canonical.file.name,
      }), prepared.canonical.file, {
        access: 'public',
        contentType: 'image/webp',
        handleUploadUrl: '/api/moniteurs/blob/upload',
        clientPayload: JSON.stringify({ kind: input.kind }),
        multipart: prepared.canonical.size > 4 * 1024 * 1024,
      })

      const variants = await Promise.all(
        prepared.variants.map(async (variant) => {
          const uploaded = await upload(buildGuideBlobPath({
            userId,
            kind: input.kind,
            filename: variant.file.name,
          }), variant.file, {
            access: 'public',
            contentType: 'image/webp',
            handleUploadUrl: '/api/moniteurs/blob/upload',
            clientPayload: JSON.stringify({ kind: input.kind }),
            multipart: variant.size > 4 * 1024 * 1024,
          })

          return {
            url: uploaded.url,
            width: variant.width,
            size: variant.size,
          }
        }),
      )

      return {
        url: blob.url,
        variants,
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
