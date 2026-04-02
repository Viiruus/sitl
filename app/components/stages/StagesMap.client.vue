<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type StageMapItem = {
  id: number | string
  slug: string
  title: string
  discipline?: string | null
  latitude: number
  longitude: number
  locationLabel: string
  sessionLabel?: string | null
  priceLabel?: string | null
  url: string
}

const props = defineProps<{
  stages: StageMapItem[]
}>()

const mapEl = ref<HTMLElement | null>(null)
const loadError = ref<string | null>(null)
let leaflet: any = null
let map: any = null
let markersLayer: any = null

const LEAFLET_SCRIPT_ID = 'bdk-leaflet-script'
const LEAFLET_STYLE_ID = 'bdk-leaflet-style'
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

const ensureLeafletLoaded = async () => {
  if (typeof window === 'undefined') return null
  if ((window as any).L) return (window as any).L

  if (!document.getElementById(LEAFLET_STYLE_ID)) {
    const link = document.createElement('link')
    link.id = LEAFLET_STYLE_ID
    link.rel = 'stylesheet'
    link.href = LEAFLET_CSS_URL
    document.head.appendChild(link)
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      if ((window as any).L) {
        resolve()
        return
      }
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Impossible de charger Leaflet.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = LEAFLET_SCRIPT_ID
    script.src = LEAFLET_JS_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossible de charger Leaflet.'))
    document.head.appendChild(script)
  })

  return (window as any).L || null
}

const disciplineTheme: Record<string, { color: string; label: string; letter: string }> = {
  FALAISE: { color: '#d65245', label: 'Falaise', letter: 'F' },
  GRANDE_VOIE: { color: '#b86b2f', label: 'Grande voie', letter: 'G' },
  BLOC: { color: '#4f9fcf', label: 'Bloc', letter: 'B' },
  TRAD: { color: '#202020', label: 'Terrain d\'aventure', letter: 'T' },
  VIA_FERRATA: { color: '#6b8e23', label: 'Via ferrata', letter: 'V' },
}

const escapeHtml = (value?: string | null) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const markerThemeFor = (discipline?: string | null) =>
  disciplineTheme[discipline || ''] || { color: '#d65245', label: 'Stage', letter: 'S' }

const markerIconFor = (discipline?: string | null) => {
  const theme = markerThemeFor(discipline)
  return leaflet.divIcon({
    className: 'stage-map-marker-wrapper',
    html: `
      <div class="stage-map-marker" style="--marker-color:${theme.color}">
        <span>${theme.letter}</span>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 46],
    popupAnchor: [0, -38],
  })
}

const validStages = () =>
  props.stages.filter((stage) =>
    Number.isFinite(stage.latitude) &&
    Number.isFinite(stage.longitude) &&
    stage.latitude >= -90 &&
    stage.latitude <= 90 &&
    stage.longitude >= -180 &&
    stage.longitude <= 180,
  )

const popupHtmlFor = (stage: StageMapItem) => {
  const theme = markerThemeFor(stage.discipline)
  return `
    <div class="stage-map-popup">
      <p class="stage-map-popup__type" style="color:${theme.color}">${escapeHtml(theme.label)}</p>
      <a class="stage-map-popup__title" href="${escapeHtml(stage.url)}">${escapeHtml(stage.title)}</a>
      <p class="stage-map-popup__meta">${escapeHtml(stage.locationLabel)}</p>
      ${stage.sessionLabel ? `<p class="stage-map-popup__meta">${escapeHtml(stage.sessionLabel)}</p>` : ''}
      ${stage.priceLabel ? `<p class="stage-map-popup__price">${escapeHtml(stage.priceLabel)}</p>` : ''}
    </div>
  `
}

const renderMarkers = async () => {
  if (!map) return

  if (!markersLayer) {
    markersLayer = leaflet.layerGroup().addTo(map)
  }
  markersLayer.clearLayers()

  const stages = validStages()
  if (!stages.length) {
    map.setView([46.603354, 1.888334], 5)
    return
  }

  const bounds = leaflet.latLngBounds([])
  stages.forEach((stage) => {
    const marker = leaflet.marker([stage.latitude, stage.longitude], {
      icon: markerIconFor(stage.discipline),
      title: stage.title,
    })
    marker.bindPopup(popupHtmlFor(stage), { closeButton: false, maxWidth: 280 })
    marker.addTo(markersLayer!)
    bounds.extend([stage.latitude, stage.longitude])
  })

  await nextTick()
  if (stages.length === 1) {
    const [stage] = stages
    map.setView([stage.latitude, stage.longitude], 10)
    return
  }
  map.fitBounds(bounds.pad(0.18), { maxZoom: 10 })
}

onMounted(async () => {
  if (!mapEl.value) return
  try {
    leaflet = await ensureLeafletLoaded()
  } catch {
    loadError.value = 'Impossible de charger la carte interactive pour le moment.'
    return
  }
  if (!leaflet) return

  map = leaflet.map(mapEl.value, {
    scrollWheelZoom: true,
    zoomControl: true,
  })

  leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  await renderMarkers()
})

watch(
  () => props.stages,
  async () => {
    await renderMarkers()
    map?.invalidateSize()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  markersLayer?.clearLayers()
  markersLayer = null
  map?.remove()
  map = null
})
</script>

<template>
  <div
    v-if="loadError"
    class="flex min-h-[20rem] items-center justify-center rounded-3xl bg-brand-950/70 px-6 py-8 text-center text-sm text-brand-100/80"
  >
    {{ loadError }}
  </div>
  <div v-else ref="mapEl" class="stage-map"></div>
</template>

<style scoped>
.stage-map {
  min-height: 30rem;
  width: 100%;
  overflow: hidden;
  border-radius: 1.5rem;
}

:global(.stage-map-marker-wrapper) {
  background: transparent;
  border: 0;
}

:global(.stage-map-marker) {
  position: relative;
  display: grid;
  height: 36px;
  width: 36px;
  place-items: center;
  border-radius: 999px 999px 999px 0;
  border: 2px solid rgba(255, 255, 255, 0.92);
  background: var(--marker-color);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  transform: rotate(-45deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
}

:global(.stage-map-marker span) {
  transform: rotate(45deg);
}

:global(.leaflet-popup-content-wrapper) {
  border-radius: 1rem;
}

:global(.leaflet-popup-content) {
  margin: 0;
}

:global(.stage-map-popup) {
  min-width: 220px;
  padding: 0.9rem 1rem;
}

:global(.stage-map-popup__type) {
  margin: 0 0 0.35rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

:global(.stage-map-popup__title) {
  display: inline-block;
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  text-decoration: none;
}

:global(.stage-map-popup__title:hover) {
  text-decoration: underline;
}

:global(.stage-map-popup__meta) {
  margin: 0.35rem 0 0;
  color: #4b5563;
  font-size: 0.84rem;
  line-height: 1.35;
}

:global(.stage-map-popup__price) {
  margin: 0.55rem 0 0;
  color: #111827;
  font-size: 0.86rem;
  font-weight: 700;
}
</style>
