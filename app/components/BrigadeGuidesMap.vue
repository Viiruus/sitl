<script setup lang="ts">
import { ArrowLeftIcon, ArrowUpRightIcon, CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { formatDurationDays, formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { layoutGuideMapMarkers } from '~~/shared/utils/guide-map'

type Guide = {
  id: number
  slug: string
  fullName: string
  firstName: string
  bio?: string | null
  baseLocation?: string | null
  baseLatitude?: number | null
  baseLongitude?: number | null
  profileImageUrl?: string | null
  profileImageVariants?: unknown
  disciplines?: string[]
  serviceAreas?: string[]
  nextStage?: {
    slug: string
    titre: string
    dateDebut: string | Date
    dateFin?: string | Date | null
    lieuLabel?: string
    jours?: number
    prixParPersonne?: number
    devise?: string
    descriptionCourte?: string | null
    niveauMinimum?: string | null
    discipline?: string
  } | null
}

const props = defineProps<{ moniteurs: Guide[] }>()
const mapElement = ref<HTMLElement | null>(null)
const panelElement = ref<HTMLElement | null>(null)
const mapWidth = ref(900)
const selectedId = ref<number | null>(null)
const selectedGuide = computed(() => props.moniteurs.find(guide => guide.id === selectedId.value) ?? props.moniteurs[0] ?? null)
const minimumDistance = computed(() => Math.min(18.5, ((mapWidth.value >= 600 ? 64 : 48) + 8) / Math.max(280, mapWidth.value) * 100))
const markers = computed(() => layoutGuideMapMarkers(props.moniteurs, minimumDistance.value).map(marker => ({
  ...marker,
  guide: props.moniteurs.find(guide => guide.id === marker.id)!,
})))
const imageFor = (guide: Guide) => resolveStoredImageSrc(guide.profileImageUrl, guide.profileImageVariants) || '/images/escalade-grande-voie-calanques.jpg'
const imageSrcset = (guide: Guide) => buildStoredSrcset(guide.profileImageVariants)
const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie', FALAISE: 'Falaise', BLOC: 'Bloc', TRAD: 'Terrain d’aventure', VIA_FERRATA: 'Via ferrata',
}
const selectedStage = computed(() => selectedGuide.value?.nextStage)
const stageDiscipline = computed(() => selectedStage.value?.discipline ? disciplineLabels[selectedStage.value.discipline] : null)
const stagePrice = computed(() => {
  const stage = selectedStage.value
  if (typeof stage?.prixParPersonne !== 'number') return null
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: stage.devise || 'EUR', maximumFractionDigits: 0 }).format(stage.prixParPersonne)
})
const nextStagePeriod = computed(() => formatSessionRangeLabel(selectedGuide.value?.nextStage?.dateDebut, selectedGuide.value?.nextStage?.dateFin))
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  if (!mapElement.value) return
  mapWidth.value = mapElement.value.clientWidth
  resizeObserver = new ResizeObserver(entries => { mapWidth.value = entries[0]?.contentRect.width || 900 })
  resizeObserver.observe(mapElement.value)
})
onUnmounted(() => resizeObserver?.disconnect())

const scrollTo = (element: HTMLElement | null) => element?.scrollIntoView({
  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  block: 'nearest',
})
const selectGuide = async (id: number) => {
  selectedId.value = id
  await nextTick()
  if (window.matchMedia('(max-width: 1023px)').matches) scrollTo(panelElement.value)
}
</script>

<template>
  <div class="brigade-atlas mt-10 overflow-hidden rounded-[2rem] border border-white/15 lg:mt-12">
    <div class="brigade-map-panel relative min-w-0 bg-[#0c3548]">
      <div class="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 sm:px-8 sm:pt-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100/80">Des visages, des territoires</p>
        <span class="rounded-full border border-white/15 px-3 py-1 text-xs text-white/85">{{ moniteurs.length }} moniteur·ices</span>
      </div>
      <p id="brigade-map-help" class="mt-2 px-6 text-sm text-brand-100/65 sm:px-8">Sélectionnez un portrait pour faire connaissance.</p>

      <div ref="mapElement" class="brigade-map relative mx-auto aspect-square w-full" role="group" aria-label="Les moniteurs de la Brigade du kiff en France" aria-describedby="brigade-map-help">
        <svg class="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <!-- Contour Natural Earth 1:110m, domaine public, identique aux mini-cartes des profils. -->
          <path d="M69.9 18.5 72.6 20.6 80.6 22 77.8 27.5 77 33.2 75.5 34.6 73 33.9 73.2 35.9 69.1 40.4 69 44 71.7 42.8 73.6 46.3 73.4 48.5 75 51.5 73.1 54 74.5 60.1 77.5 61.2 76.9 64.6 71.8 69.2 60.9 67 52.8 69.6 52.1 74.4 45.7 75.4 39.4 71.8 37.4 73.6 27.2 69.9 25 66.8 27.8 62 28.9 46.1 23.2 37.7 19.1 33.6 10.6 30.5 10 24.7 17.2 23 26.5 25 24.8 16 30 19.4 43 13.2 44.6 6.6 49.5 5 50.3 7.8 52.9 7.9 55.5 11.2 59.4 14.9 62.2 14.3 67.1 18 68.3 18.6Z" class="fill-[#17475a] stroke-[#81a6ac]" stroke-width="0.23" stroke-linejoin="round" />
          <path d="M84.2 73.2 87.7 70.1 88.7 77 86.9 83.1 84.3 81.5 83 76.1Z" class="fill-[#17475a] stroke-[#81a6ac]" stroke-width="0.23" stroke-linejoin="round" />
          <g v-for="marker in markers" :key="marker.id">
            <line :x1="marker.anchorX" :y1="marker.anchorY" :x2="marker.x" :y2="marker.y" :stroke="selectedGuide?.id === marker.id ? '#fcd34d' : '#a3bec2'" :stroke-opacity="selectedGuide?.id === marker.id ? 1 : 0.55" stroke-width="1" vector-effect="non-scaling-stroke" />
          </g>
          <circle v-for="marker in markers" :key="`point-${marker.id}`" :cx="marker.anchorX" :cy="marker.anchorY" :r="selectedGuide?.id === marker.id ? 0.8 : 0.5" fill="#fcd34d" stroke="#0c3548" stroke-width="0.15" />
        </svg>

        <button
          v-for="marker in markers"
          :key="marker.id"
          type="button"
          class="brigade-map-portrait group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-0.5 focus-visible:z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          :class="selectedGuide?.id === marker.id ? 'z-20' : 'z-10 hover:z-30'"
          :style="{ left: `${marker.x}%`, top: `${marker.y}%` }"
          :aria-label="`Découvrir ${marker.guide.fullName}, ${marker.guide.baseLocation || 'camp de base'}`"
          :aria-pressed="selectedGuide?.id === marker.id"
          aria-controls="brigade-guide-panel"
          @click="selectGuide(marker.id)"
        >
          <img :src="imageFor(marker.guide)" :srcset="imageSrcset(marker.guide)" sizes="64px" alt="" width="64" height="64" loading="lazy" decoding="async" class="size-full rounded-full object-cover shadow-lg transition group-hover:scale-105 motion-reduce:transform-none" :class="selectedGuide?.id === marker.id ? 'ring-[3px] ring-amber-300' : 'ring-2 ring-white/85 group-hover:ring-amber-200'" />
          <span class="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-52 -translate-x-1/2 rounded-lg bg-brand-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">{{ marker.guide.fullName }}</span>
        </button>
      </div>

    </div>

    <aside v-if="selectedGuide" id="brigade-guide-panel" ref="panelElement" aria-labelledby="brigade-guide-name" class="flex min-w-0 scroll-mt-24 flex-col bg-[#f8f6ef] text-brand-950">
      <div class="relative aspect-[4/3] overflow-hidden bg-brand-900 lg:aspect-square">
        <img :key="selectedGuide.id" :src="imageFor(selectedGuide)" :srcset="imageSrcset(selectedGuide)" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 60vw, 100vw" :alt="selectedGuide.fullName" class="size-full object-cover" width="600" height="600" loading="lazy" decoding="async" />
      </div>
      <div class="flex flex-1 flex-col p-6 sm:p-7">
        <button type="button" class="mb-5 inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold text-brand-800 underline underline-offset-4 lg:hidden" @click="scrollTo(mapElement)"><ArrowLeftIcon class="size-4" aria-hidden="true" />Retour à la carte</button>
        <div class="flex items-start justify-between gap-3">
          <h3 id="brigade-guide-name" class="min-w-0 text-2xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] xl:text-3xl">{{ selectedGuide.fullName }}</h3>
          <NuxtLink :to="`/moniteurs/${selectedGuide.slug}`" class="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-brand-900 underline decoration-brand-950/30 underline-offset-4 transition hover:decoration-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-800">
            Voir son profil<ArrowUpRightIcon class="size-3.5" aria-hidden="true" />
          </NuxtLink>
        </div>
        <p class="mt-3 flex items-start gap-2 text-sm leading-relaxed text-brand-900/75"><MapPinIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" />{{ selectedGuide.baseLocation }}</p>
        <div v-if="selectedStage" class="mt-6 border-t border-brand-950/15 pt-6">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-800">Son prochain stage</p>
          <h4 class="mt-3 text-xl font-semibold leading-snug">{{ selectedStage.titre }}</h4>
          <div v-if="stageDiscipline || selectedStage.niveauMinimum" class="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-brand-900">
            <span v-if="stageDiscipline" class="rounded-full bg-brand-950/[0.06] px-2.5 py-1">{{ stageDiscipline }}</span>
            <span v-if="selectedStage.niveauMinimum" class="rounded-full bg-brand-950/[0.06] px-2.5 py-1">Niveau {{ selectedStage.niveauMinimum }}</span>
          </div>
          <dl class="mt-4 space-y-3 text-sm leading-relaxed text-brand-950/80">
            <div class="flex items-start gap-2.5"><CalendarDaysIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" /><dt class="sr-only">Dates</dt><dd>{{ nextStagePeriod }}</dd></div>
            <div v-if="selectedStage.lieuLabel" class="flex items-start gap-2.5"><MapPinIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" /><dt class="sr-only">Lieu du stage</dt><dd>{{ selectedStage.lieuLabel }}</dd></div>
            <div v-if="selectedStage.jours" class="flex items-start gap-2.5"><ClockIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" /><dt class="sr-only">Durée</dt><dd>{{ formatDurationDays(selectedStage.jours) }}</dd></div>
          </dl>
          <p v-if="selectedStage.descriptionCourte" class="mt-4 line-clamp-3 text-sm leading-6 text-brand-950/75">{{ selectedStage.descriptionCourte }}</p>
          <p v-if="stagePrice" class="mt-5 text-xl font-semibold">{{ stagePrice }}<span class="ml-1 text-xs font-normal text-brand-900/65">/ personne</span></p>
        </div>
        <p v-else class="mt-6 rounded-xl border border-brand-950/10 p-4 text-sm leading-relaxed text-brand-900/70">Aucun départ annoncé pour le moment.</p>
        <NuxtLink v-if="selectedStage" :to="`/stages-escalade/${selectedStage.slug}`" class="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-800">
          Découvrir ce stage<ArrowUpRightIcon class="size-4" aria-hidden="true" />
        </NuxtLink>
      </div>
    </aside>
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ selectedId ? `Profil sélectionné : ${selectedGuide?.fullName}` : '' }}</p>
  </div>
</template>

<style scoped>
.brigade-atlas { display: grid; }
.brigade-map-panel {
  background-image: radial-gradient(rgba(174, 207, 209, 0.13) 0.7px, transparent 0.7px);
  background-size: 22px 22px;
}
.brigade-map-portrait { width: 48px; height: 48px; }
@media (min-width: 1024px) {
  .brigade-atlas { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
}
@container (min-width: 600px) {
  .brigade-map-portrait { width: 64px; height: 64px; }
}
.brigade-map { container-type: inline-size; }
@media (prefers-reduced-motion: reduce) {
  .brigade-atlas :deep(*) { transition: none; }
}
</style>
