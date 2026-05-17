<script setup lang="ts">
import { renderSVG } from 'uqr'

const props = withDefaults(defineProps<{
  profileUrl: string
  guideName?: string | null
  fileName?: string | null
}>(), {
  guideName: 'Moniteur·ice',
  fileName: 'qr-code-profil-moniteur',
})

const qrError = ref<string | null>(null)
const downloadPending = ref(false)

const CANVAS_SIZE = 280
const SVG_PIXEL_SIZE = 8
const QR_COLOR = '#ffcf00'

const buildQrSvgMarkup = () => {
  try {
    qrError.value = null
    return renderSVG(props.profileUrl, {
      ecc: 'M',
      border: 2,
      pixelSize: SVG_PIXEL_SIZE,
      whiteColor: 'transparent',
      blackColor: QR_COLOR,
    })
  } catch {
    qrError.value = 'Impossible de generer le QR code.'
    return null
  }
}

const qrSvgMarkup = computed(() => buildQrSvgMarkup())

const qrSvgDataUrl = computed(() => {
  if (!qrSvgMarkup.value) return null
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvgMarkup.value)}`
})

const triggerDownload = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.fileName || 'qr-code-profil-moniteur'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Impossible de charger le QR code.'))
    image.src = src
  })

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Impossible de preparer le QR code.'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })

const downloadQrCode = async () => {
  if (!qrSvgDataUrl.value) return

  downloadPending.value = true
  try {
    const image = await loadImage(qrSvgDataUrl.value)
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth || CANVAS_SIZE
    canvas.height = image.naturalHeight || CANVAS_SIZE

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Impossible de preparer le QR code.')
    }

    context.drawImage(image, 0, 0)

    const blob = await canvasToBlob(canvas)
    const blobUrl = URL.createObjectURL(blob)
    triggerDownload(blobUrl)
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 0)
  } catch (error) {
    qrError.value = error instanceof Error ? error.message : 'Impossible de telecharger le QR code.'
  } finally {
    downloadPending.value = false
  }
}
</script>

<template>
  <section class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
    <div class="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
      <div class="max-w-xl">
        <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
          Profil public
        </p>
        <h2 class="mt-3 text-2xl font-semibold text-white">
          QR code du profil
        </h2>
        <p class="mt-3 text-sm text-brand-100/80">
          Affiche ce QR code pour envoyer directement vers la page publique de {{ guideName || 'ce profil' }}.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink
            :to="profileUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center rounded-full bg-secondaryBrand-400 px-5 py-3 text-sm font-semibold text-brand-950 transition hover:bg-secondaryBrand-300"
          >
            Voir le profil
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="downloadPending"
            @click="downloadQrCode"
          >
            {{ downloadPending ? 'Preparation...' : 'Telecharger le QR code' }}
          </button>
        </div>
        <p class="mt-4 break-all text-xs text-brand-200/60">
          {{ profileUrl }}
        </p>
      </div>

      <div class="self-center rounded-[2rem] bg-white/5 p-4 shadow-2xl shadow-black/30 ring-1 ring-white/10">
        <img
          v-if="qrSvgDataUrl"
          :src="qrSvgDataUrl"
          alt="QR code du profil moniteur·ice"
          class="block h-[280px] w-[280px] max-w-full rounded-2xl"
        />
      </div>
    </div>

    <p v-if="qrError" class="mt-4 text-sm text-red-300">
      {{ qrError }}
    </p>
  </section>
</template>
