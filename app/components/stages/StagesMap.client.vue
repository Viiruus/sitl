<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type StageMapItem = {
  id: number | string
  slug: string
  title: string
  subtitle?: string | null
  discipline?: string | null
  latitude: number
  longitude: number
  locationLabel: string
  durationLabel?: string | null
  sessionLabel?: string | null
  priceLabel?: string | null
  coverImageUrl: string
  guideName?: string | null
  guideImageUrl?: string | null
  isSoldOut?: boolean
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

const disciplineTheme: Record<string, { color: string; label: string; icon: string }> = {
  FALAISE: { color: '#d65245', label: 'Falaise', icon: '/images/couenne-white.png' },
  GRANDE_VOIE: { color: '#b86b2f', label: 'Grande voie', icon: '/images/grande-voie-white.png' },
  BLOC: { color: '#4f9fcf', label: 'Bloc', icon: '/images/bloc-white.png' },
  TRAD: { color: '#202020', label: 'Terrain d\'aventure', icon: '/images/trad-white.png' },
  VIA_FERRATA: { color: '#6b8e23', label: 'Via ferrata', icon: '/images/via-ferrata-white.svg' },
}

const escapeHtml = (value?: string | null) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const markerThemeFor = (discipline?: string | null) =>
  disciplineTheme[discipline || ''] || disciplineTheme.GRANDE_VOIE

const markerIconFor = (discipline?: string | null) => {
  const theme = markerThemeFor(discipline)
  return leaflet.divIcon({
    className: 'stage-map-marker-wrapper',
    html: `
      <div class="stage-map-marker" style="--marker-color:${theme.color}">
        <img src="${theme.icon}" alt="" aria-hidden="true">
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
    <a class="stage-map-popup" href="${escapeHtml(stage.url)}" aria-label="Voir le stage ${escapeHtml(stage.title)}">
      <div class="stage-map-popup__media">
        <img class="stage-map-popup__cover" src="${escapeHtml(stage.coverImageUrl)}" alt="${escapeHtml(stage.title)}">
        <div class="stage-map-popup__gradient"></div>
        ${stage.isSoldOut ? '<span class="stage-map-popup__sold-out">Complet</span>' : ''}
        <div class="stage-map-popup__topline">
          <span class="stage-map-popup__type">${escapeHtml(theme.label)}</span>
        </div>
        <div class="stage-map-popup__summary">
          <h3 class="stage-map-popup__title">${escapeHtml(stage.title)}</h3>
          ${stage.subtitle ? `<p class="stage-map-popup__subtitle">${escapeHtml(stage.subtitle)}</p>` : ''}
          <div class="stage-map-popup__details">
            ${stage.durationLabel ? `
              <span class="stage-map-popup__duration">${escapeHtml(stage.durationLabel)}</span>
            ` : ''}
            ${stage.sessionLabel ? `
              <span class="stage-map-popup__detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <path d="M16 2v4M8 2v4M3 10h18"></path>
                </svg>
                ${escapeHtml(stage.sessionLabel)}
              </span>
            ` : ''}
            <span class="stage-map-popup__detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z"></path>
                <circle cx="12" cy="11" r="2.3"></circle>
              </svg>
              ${escapeHtml(stage.locationLabel)}
            </span>
          </div>
        </div>
      </div>
      <div class="stage-map-popup__footer">
        <span class="stage-map-popup__guide">
          ${stage.guideImageUrl
            ? `<img src="${escapeHtml(stage.guideImageUrl)}" alt="">`
            : `<span class="stage-map-popup__guide-fallback"><img src="${escapeHtml(theme.icon)}" alt="" aria-hidden="true"></span>`}
          <span>
            <small>Moniteur</small>
            <strong>${escapeHtml(stage.guideName || 'la Brigade du Kiff')}</strong>
          </span>
        </span>
        ${stage.priceLabel ? `<strong class="stage-map-popup__price">${escapeHtml(stage.priceLabel)}</strong>` : ''}
      </div>
      <span class="stage-map-popup__cta">Découvrir le stage <span aria-hidden="true">→</span></span>
    </a>
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
    marker.bindPopup(popupHtmlFor(stage), {
      className: 'stage-map-card-popup',
      closeButton: true,
      minWidth: 280,
      maxWidth: 320,
    })
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

:global(.stage-map-marker img) {
  height: 24px;
  width: 24px;
  object-fit: contain;
  transform: rotate(45deg);
}

:global(.stage-map-card-popup .leaflet-popup-content-wrapper) {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.4rem;
  background: #082f49;
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.38);
}

:global(.stage-map-card-popup .leaflet-popup-content) {
  margin: 0;
}

:global(.stage-map-card-popup .leaflet-popup-tip) {
  background: #082f49;
}

:global(.stage-map-card-popup .leaflet-popup-close-button) {
  top: 0.7rem !important;
  right: 0.7rem !important;
  z-index: 5;
  display: grid;
  height: 1.75rem !important;
  width: 1.75rem !important;
  place-items: center;
  border-radius: 999px;
  background: rgba(8, 47, 73, 0.8) !important;
  color: #fff !important;
  font-size: 1.25rem !important;
  line-height: 1 !important;
  backdrop-filter: blur(8px);
}

:global(.stage-map-popup) {
  display: block;
  overflow: hidden;
  color: #fff !important;
  font-family: inherit;
  text-decoration: none !important;
}

:global(.stage-map-popup__media) {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: #0c4a6e;
}

:global(.stage-map-popup__cover) {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

:global(.stage-map-popup:hover .stage-map-popup__cover) {
  transform: scale(1.04);
}

:global(.stage-map-popup__gradient) {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 47, 73, 1) 2%, rgba(8, 47, 73, 0.58) 52%, rgba(8, 47, 73, 0.12) 100%);
}

:global(.stage-map-popup__topline) {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  right: 3rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

:global(.stage-map-popup__type) {
  overflow: hidden;
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.86);
  color: #fff7ed;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

:global(.stage-map-popup__sold-out) {
  position: absolute;
  top: 1.1rem;
  left: -2.4rem;
  z-index: 4;
  width: 9rem;
  transform: rotate(-40deg);
  background: #dc2626;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.3rem;
  text-align: center;
  text-transform: uppercase;
}

:global(.stage-map-popup__sold-out + .stage-map-popup__topline) {
  left: 3.3rem;
}

:global(.stage-map-popup__summary) {
  position: absolute;
  right: 1rem;
  bottom: 0.9rem;
  left: 1rem;
}

:global(.stage-map-popup__title) {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:global(.stage-map-popup__subtitle) {
  overflow: hidden;
  margin: 0.28rem 0 0;
  color: rgba(224, 242, 254, 0.84);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.stage-map-popup__details) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.6rem;
  margin-top: 0.6rem;
}

:global(.stage-map-popup__duration) {
  padding: 0.2rem 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 999px;
  background: rgba(8, 47, 73, 0.62);
  color: #fff;
  font-size: 0.64rem;
  font-weight: 700;
}

:global(.stage-map-popup__detail) {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.3rem;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 600;
}

:global(.stage-map-popup__detail:last-child) {
  flex-basis: 100%;
}

:global(.stage-map-popup__detail svg) {
  height: 0.9rem;
  width: 0.9rem;
  flex: 0 0 auto;
  color: #fbbf24;
}

:global(.stage-map-popup__footer) {
  display: flex;
  min-height: 4.2rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem 0.55rem;
  background: #082f49;
}

:global(.stage-map-popup__guide) {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.55rem;
}

:global(.stage-map-popup__guide > img),
:global(.stage-map-popup__guide-fallback) {
  display: grid;
  height: 2.2rem;
  width: 2.2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: #0c4a6e;
  object-fit: cover;
}

:global(.stage-map-popup__guide-fallback img) {
  height: 1.4rem;
  width: 1.4rem;
  object-fit: contain;
}

:global(.stage-map-popup__guide span:last-child) {
  min-width: 0;
}

:global(.stage-map-popup__guide small) {
  display: block;
  color: rgba(186, 230, 253, 0.7);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

:global(.stage-map-popup__guide strong) {
  display: block;
  overflow: hidden;
  max-width: 9rem;
  margin-top: 0.08rem;
  color: #fff;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.stage-map-popup__price) {
  flex: 0 0 auto;
  color: #fff;
  font-size: 0.75rem;
  text-align: right;
}

:global(.stage-map-popup__cta) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.38rem 1rem 0.72rem;
  background: #082f49;
  color: #fbbf24;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
