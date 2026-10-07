<script setup lang="ts">
import { ensureLeafletLoaded } from '~/utils/leaflet'
import { departmentMapConfig } from '~~/shared/utils/department-map'
import type { DepartmentMapCode, DepartmentMapPoint } from '~~/shared/utils/department-map'

const props = defineProps<{
  departmentCode: DepartmentMapCode
  points: DepartmentMapPoint[]
}>()

const mapEl = ref<HTMLElement | null>(null)
const loadError = ref(false)
const ready = ref(false)
const activeView = ref<'department' | 'all'>('department')
let leaflet: any = null
let map: any = null
let outlineLayer: any = null
let markersLayer: any = null
let resizeObserver: ResizeObserver | null = null
let disposed = false
const abortController = new AbortController()

const iconHtml = (kind: DepartmentMapPoint['kind']) => kind === 'guide'
  ? '<path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" />'
  : '<path d="m2 20 8-15 5 9 3-5 4 11ZM7 11l3 2 3-2" />'

const popupFor = (points: DepartmentMapPoint[]) => {
  const content = document.createElement('div')
  content.className = 'department-map-popup__places'
  points.forEach(point => {
    const link = document.createElement('a')
    link.className = 'department-map-popup__link'
    link.href = point.url
    const type = document.createElement('span')
    type.className = 'department-map-popup__kind'
    type.textContent = point.kind === 'guide' ? 'Camp de base du moniteur' : 'Lieu du stage'
    const title = document.createElement('strong')
    title.textContent = point.title
    const place = document.createElement('span')
    place.className = 'department-map-popup__location'
    place.textContent = point.locationLabel
    const cta = document.createElement('span')
    cta.className = 'department-map-popup__cta'
    cta.textContent = point.kind === 'guide' ? 'Voir le profil →' : 'Découvrir le stage →'
    link.append(type, title, place, cta)
    content.appendChild(link)
  })
  return content
}

const fitView = (view: 'department' | 'all') => {
  if (!map || !outlineLayer) return
  activeView.value = view
  const departmentBounds = outlineLayer.getBounds()
  const bounds = leaflet.latLngBounds(departmentBounds.getSouthWest(), departmentBounds.getNorthEast())
  // Keep nearby cross-border bases and stages visible in the department view.
  const nearbyBounds = departmentBounds.pad(0.25)
  props.points.forEach(point => {
    const position = [point.latitude, point.longitude]
    if (view === 'all' || nearbyBounds.contains(position)) bounds.extend(position)
  })
  map.fitBounds(bounds, { padding: [28, 28], maxZoom: 10, animate: false })
}

const renderMarkers = () => {
  if (!map || !leaflet) return
  markersLayer.clearLayers()
  const groups = new Map<string, DepartmentMapPoint[]>()
  props.points.forEach(point => {
    const key = `${point.latitude},${point.longitude}`
    const group = groups.get(key) || []
    group.push(point)
    groups.set(key, group)
  })
  groups.forEach(points => {
    const kinds = [...new Set(points.map(point => point.kind))]
    const marker = leaflet.marker([points[0].latitude, points[0].longitude], {
      icon: leaflet.divIcon({
        className: 'department-map-marker',
        html: kinds.map(kind => `<span class="department-map-pin department-map-pin--${kind}" data-location-kind="${kind}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconHtml(kind)}</svg></span>`).join(''),
        iconSize: [40 * kinds.length, 48],
        iconAnchor: [20 * kinds.length, 46],
        popupAnchor: [0, -40],
      }),
      title: points.map(point => point.title).join(' · '),
      alt: points.map(point => `${point.kind === 'guide' ? 'Moniteur' : 'Stage'} : ${point.title}`).join(' · '),
      autoPanOnFocus: false,
    })
    marker.bindPopup(popupFor(points), { className: 'department-map-popup', minWidth: 220, maxWidth: 300, maxHeight: 280 })
    marker.addTo(markersLayer)
  })
}

onMounted(async () => {
  const timeout = setTimeout(() => abortController.abort(), 15000)
  try {
    const [library, outline] = await Promise.all([
      ensureLeafletLoaded(),
      fetch(departmentMapConfig[props.departmentCode].outlineUrl, { signal: abortController.signal }).then(response => {
        if (!response.ok) throw new Error('Contour indisponible.')
        return response.json()
      }),
    ])
    if (disposed || !mapEl.value || !library) return
    leaflet = library
    map = leaflet.map(mapEl.value, { scrollWheelZoom: false, zoomControl: true, zoomSnap: 0.25 })
    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    outlineLayer = leaflet.geoJSON(outline, {
      interactive: false,
      style: { color: '#fbbf24', weight: 2.5, fillColor: '#0c4a6e', fillOpacity: 0.08 },
      attribution: 'Contours : <a href="https://etalab-datasets.geo.data.gouv.fr/contours-administratifs/2025/geojson/">Etalab</a>',
    }).addTo(map)
    if (!outlineLayer.getBounds().isValid()) throw new Error('Contour invalide.')
    markersLayer = leaflet.layerGroup().addTo(map)
    renderMarkers()
    fitView('department')
    ready.value = true
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize({ pan: false })
      fitView(activeView.value)
    })
    resizeObserver.observe(mapEl.value)
  } catch {
    if (!disposed) {
      map?.remove()
      map = null
      loadError.value = true
    }
  } finally {
    clearTimeout(timeout)
  }
})

watch(() => props.points, () => {
  if (!ready.value) return
  renderMarkers()
  fitView(activeView.value)
}, { deep: true })

onBeforeUnmount(() => {
  disposed = true
  abortController.abort()
  resizeObserver?.disconnect()
  map?.remove()
  map = null
})
</script>

<template>
  <div>
    <div v-if="loadError" class="flex h-[26rem] flex-col items-center justify-center gap-3 px-6 text-center text-sm leading-6 text-brand-100/80 sm:h-[32rem]" role="status">
      <p>La carte n’est pas disponible pour le moment.</p>
      <p>Retrouve les lieux dans les profils et les stages ci-dessus.</p>
    </div>
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <p class="text-sm font-semibold">{{ departmentMapConfig[departmentCode].name }}</p>
        <div class="flex flex-wrap gap-2" aria-label="Cadrage de la carte">
          <button type="button" :disabled="!ready" :aria-pressed="activeView === 'department'" class="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-300" :class="activeView === 'department' ? 'bg-white/10 text-white' : 'text-brand-100/75'" @click="fitView('department')">
            Vue département
          </button>
          <button v-if="points.length" type="button" :disabled="!ready" :aria-pressed="activeView === 'all'" class="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-300" :class="activeView === 'all' ? 'bg-white/10 text-white' : 'text-brand-100/75'" @click="fitView('all')">
            Tous les lieux
          </button>
        </div>
      </div>
      <div class="relative">
        <div ref="mapEl" class="department-map" role="region" :aria-label="`Carte de ${departmentMapConfig[departmentCode].name} : camps de base des moniteurs et lieux des stages`" />
        <p v-if="!ready" class="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-950/80 px-6 text-center text-sm text-brand-100/75" role="status">Chargement de la carte…</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.department-map {
  position: relative;
  z-index: 0;
  height: 26rem;
  width: 100%;
  background: #e2e8f0;
  font-family: inherit;
}
@media (min-width: 640px) {
  .department-map { height: 32rem; }
}
:global(.department-map-marker) {
  display: flex;
  justify-content: center;
  background: transparent;
  border: 0;
}
:global(.department-map-pin) {
  display: grid;
  width: 36px;
  height: 36px;
  margin: 2px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 3px 12px rgb(0 0 0 / 30%);
}
:global(.department-map-pin--guide) { background: #075985; color: #fff; }
:global(.department-map-pin--stage) { background: #f59e0b; color: #082f49; }
:global(.department-map-pin svg) { width: 20px; height: 20px; transform: rotate(45deg); }
:global(.department-map-marker:focus-visible) { outline: 3px solid #075985; outline-offset: 4px; }
:global(.department-map-popup .leaflet-popup-content-wrapper),
:global(.department-map-popup .leaflet-popup-tip) { background: #082f49; color: #fff; }
:global(.department-map-popup .leaflet-popup-content) { margin: 18px; }
:global(.department-map-popup .leaflet-popup-close-button) { color: #fff !important; }
:global(.department-map-popup__places) { display: grid; gap: 16px; }
:global(.department-map-popup__link) { display: grid; gap: 6px; color: #fff !important; text-decoration: none !important; }
:global(.department-map-popup__link + .department-map-popup__link) { border-top: 1px solid rgb(255 255 255 / 15%); padding-top: 16px; }
:global(.department-map-popup__kind) { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #fbbf24; }
:global(.department-map-popup__link strong) { font-size: 15px; line-height: 1.4; }
:global(.department-map-popup__location) { color: #bae6fd; font-size: 12px; }
:global(.department-map-popup__cta) { color: #fbbf24; font-size: 12px; font-weight: 600; margin-top: 4px; }
:global(.department-map-popup__link:hover .department-map-popup__cta) { text-decoration: underline; }
</style>
