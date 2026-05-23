<script setup lang="ts">
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { formatDurationDays, formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { getGuideRoleLabel } from '~~/shared/utils/guide-gender'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { data, pending, error } = await useFetch('/api/aventures')

const canonicalUrl = computed(() => {
  try {
    return new URL('/stages-escalade', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/stages-escalade'
  }
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
}))

useSeoMeta({
  title: 'Tous les stages d’escalade | Aventures outdoor',
  description:
    'Découvre nos stages d’escalade en falaise, grande voie, bloc, terrain d\'aventure et via ferrata. Moniteurs locaux et progression.',
  robots: 'index, follow, max-image-preview:large',
})

const selectedDiscipline = ref<string | null>(null)
const selectedRegion = ref<string | null>(null)
const dateRangeStart = ref('')
const dateRangeEnd = ref('')
const activeView = ref<'list' | 'map'>('list')
const disciplineQueryAliases: Record<string, string> = {
  TERRAIN_AVENTURE: 'TRAD',
}

const normalizeDisciplineFilter = (value?: string | null) => {
  if (!value) return null
  const normalized = value.toUpperCase()
  return disciplineQueryAliases[normalized] ?? normalized
}

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Terrain d\'aventure',
  VIA_FERRATA: 'Via ferrata',
}

const formatDisciplineLabel = (value: string) => {
  return disciplineLabels[value] ?? value?.replace(/_/g, ' ') ?? 'Autre'
}

type RegionBounds = {
  value: string
  label: string
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const regionBounds: RegionBounds[] = [
  { value: 'corse', label: 'Corse', minLat: 41.3, maxLat: 43.1, minLng: 8.4, maxLng: 9.7 },
  { value: 'bretagne', label: 'Bretagne', minLat: 47.2, maxLat: 49.2, minLng: -5.3, maxLng: -1.0 },
  { value: 'normandie', label: 'Normandie', minLat: 48.1, maxLat: 50.2, minLng: -1.9, maxLng: 1.9 },
  { value: 'hauts-de-france', label: 'Hauts-de-France', minLat: 49.5, maxLat: 51.2, minLng: 1.2, maxLng: 4.4 },
  { value: 'ile-de-france', label: 'Île-de-France', minLat: 48.0, maxLat: 49.3, minLng: 1.4, maxLng: 3.7 },
  { value: 'grand-est', label: 'Grand Est', minLat: 47.4, maxLat: 50.3, minLng: 3.4, maxLng: 8.4 },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire', minLat: 46.2, maxLat: 48.8, minLng: -2.8, maxLng: 0.9 },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire', minLat: 46.3, maxLat: 48.9, minLng: 0.0, maxLng: 3.2 },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté', minLat: 46.1, maxLat: 48.7, minLng: 2.8, maxLng: 7.2 },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine', minLat: 42.7, maxLat: 47.3, minLng: -1.8, maxLng: 2.6 },
  { value: 'occitanie', label: 'Occitanie', minLat: 42.3, maxLat: 45.1, minLng: -0.4, maxLng: 4.9 },
  { value: 'provence-alpes-cote-d-azur', label: 'Provence-Alpes-Côte d’Azur', minLat: 43.0, maxLat: 45.2, minLng: 4.2, maxLng: 7.8 },
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes', minLat: 44.0, maxLat: 46.9, minLng: 3.6, maxLng: 7.3 },
]

const getRegionForCoordinates = (latitude?: number | null, longitude?: number | null) => {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  return regionBounds.find(
    (region) =>
      latitude >= region.minLat &&
      latitude <= region.maxLat &&
      longitude >= region.minLng &&
      longitude <= region.maxLng,
  ) ?? null
}

const publishedAventures = computed(() =>
  (data.value?.aventures ?? []).filter((aventure: any) => aventure?.estPublie === true),
)

const disciplineOptions = computed(() => {
  const adventures = publishedAventures.value
  const seen = new Set<string>()
  const options = adventures.reduce<{ value: string; label: string }[]>((acc, aventure) => {
    if (aventure.discipline && !seen.has(aventure.discipline)) {
      seen.add(aventure.discipline)
      acc.push({
        value: aventure.discipline,
        label: formatDisciplineLabel(aventure.discipline),
      })
    }
    return acc
  }, [])
  return options
})

const regionOptions = computed(() => {
  const seen = new Set<string>()

  return publishedAventures.value.reduce<{ value: string; label: string }[]>((acc, aventure: any) => {
    const region = getRegionForCoordinates(aventure.latitude, aventure.longitude)
    if (region && !seen.has(region.value)) {
      seen.add(region.value)
      acc.push({ value: region.value, label: region.label })
    }
    return acc
  }, []).sort((a, b) => a.label.localeCompare(b.label, 'fr'))
})

watch(regionOptions, (options) => {
  if (selectedRegion.value && !options.some((option) => option.value === selectedRegion.value)) {
    selectedRegion.value = null
  }
})

const disciplineIconMap: Record<string, string> = {
  GRANDE_VOIE: '/images/grande-voie-white.png',
  FALAISE: '/images/couenne-white.png',
  BLOC: '/images/bloc-white.png',
  TRAD: '/images/trad-white.png',
  VIA_FERRATA: '/images/via-ferrata-white.svg',
}

const iconPathForDiscipline = (value?: string | null) => {
  if (!value) return disciplineIconMap.GRANDE_VOIE
  return disciplineIconMap[value] ?? disciplineIconMap.GRANDE_VOIE
}

const initialQueryDiscipline = route.query.discipline
if (typeof initialQueryDiscipline === 'string') {
  selectedDiscipline.value = normalizeDisciplineFilter(initialQueryDiscipline)
}

// ✅ Helper manquant pour la fallback image selon la discipline
const disciplineImageMap: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
  VIA_FERRATA: '/images/rappel-Calanques.jpg',
}

const imageForDiscipline = (value?: string | null) => {
  if (!value) return '/images/escalade-grande-voie-calanques.jpg'
  return disciplineImageMap[value] ?? '/images/escalade-grande-voie-calanques.jpg'
}

const formatSessionRange = (session: any) =>
  formatSessionRangeLabel(session?.dateDebut, session?.dateFin)

const parseDateInput = (value: string, endOfDay = false) => {
  if (!value) return null
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`)
  return Number.isNaN(date.getTime()) ? null : date
}

const selectedDateStart = computed(() => parseDateInput(dateRangeStart.value))
const selectedDateEnd = computed(() => parseDateInput(dateRangeEnd.value, true))

const hasDateRangeFilter = computed(() => Boolean(selectedDateStart.value || selectedDateEnd.value))

const resetDateRange = () => {
  dateRangeStart.value = ''
  dateRangeEnd.value = ''
}

const getUpcomingSessions = (aventure: any) => {
  if (Array.isArray(aventure?.sessions) && aventure.sessions.length) return aventure.sessions
  return aventure?.nextSession ? [aventure.nextSession] : []
}

const sessionOverlapsSelectedDateRange = (session: any) => {
  if (!hasDateRangeFilter.value) return true
  if (!session?.dateDebut) return false

  const sessionStart = new Date(session.dateDebut)
  const sessionEnd = session?.dateFin ? new Date(session.dateFin) : sessionStart
  if (Number.isNaN(sessionStart.getTime()) || Number.isNaN(sessionEnd.getTime())) return false

  const rangeStart = selectedDateStart.value
  const rangeEnd = selectedDateEnd.value
  if (rangeStart && sessionEnd < rangeStart) return false
  if (rangeEnd && sessionStart > rangeEnd) return false
  return true
}

const getDisplaySession = (aventure: any) => {
  if (!hasDateRangeFilter.value) return aventure?.nextSession ?? null
  return getUpcomingSessions(aventure).find(sessionOverlapsSelectedDateRange) ?? aventure?.nextSession ?? null
}

const filteredAventures = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let adventures = publishedAventures.value
    .map((aventure: any) => {
      const nextDate = aventure.nextSession?.dateDebut ? new Date(aventure.nextSession.dateDebut).getTime() : null
      const hasSessions = Array.isArray(aventure.sessions) && aventure.sessions.length > 0
      return { ...aventure, nextDate, hasSessions }
    })
    .filter((aventure: any) => {
      if (aventure.nextDate) {
        return aventure.nextDate >= today.getTime()
      }
      return false
    })

  if (selectedDiscipline.value) {
    adventures = adventures.filter(
      (aventure) => aventure.discipline === selectedDiscipline.value
    )
  }

  if (hasDateRangeFilter.value) {
    adventures = adventures.filter((aventure: any) =>
      getUpcomingSessions(aventure).some(sessionOverlapsSelectedDateRange),
    )
  }

  if (selectedRegion.value) {
    adventures = adventures.filter((aventure: any) => {
      const region = getRegionForCoordinates(aventure.latitude, aventure.longitude)
      return region?.value === selectedRegion.value
    })
  }

  adventures.sort((a: any, b: any) => {
    const aDate = a.nextDate ?? null
    const bDate = b.nextDate ?? null

    if (aDate && bDate) return aDate - bDate
    if (aDate && !bDate) return -1
    if (!aDate && bDate) return 1
    return 0
  })

  return adventures
})

const stageCoverSrc = (stage: any) => {
  return resolveStoredImageSrc(stage?.coverImageUrl, stage?.coverImageVariants) || imageForDiscipline(stage?.discipline)
}

const stageCoverSrcset = (stage: any) => {
  return buildStoredSrcset(stage?.coverImageVariants)
}

const guideAvatarSrc = (stage: any) => {
  return resolveStoredImageSrc(stage?.guideImageUrl, stage?.guideImageVariants) || imageForDiscipline(stage?.discipline)
}

const guideAvatarSrcset = (stage: any) => {
  return buildStoredSrcset(stage?.guideImageVariants)
}

const hasStageCoordinates = (stage: any) => {
  return (
    typeof stage?.latitude === 'number' &&
    typeof stage?.longitude === 'number' &&
    Number.isFinite(stage.latitude) &&
    Number.isFinite(stage.longitude) &&
    stage.latitude >= -90 &&
    stage.latitude <= 90 &&
    stage.longitude >= -180 &&
    stage.longitude <= 180
  )
}

const formatMapPrice = (price?: number | null) => {
  if (typeof price !== 'number' || Number.isNaN(price)) return null
  return `${price} € / pers`
}

const mapStages = computed(() =>
  filteredAventures.value
    .filter((stage: any) => hasStageCoordinates(stage))
    .map((stage: any) => ({
      id: stage.id,
      slug: stage.slug,
      title: stage.titre,
      discipline: stage.discipline,
      latitude: stage.latitude,
      longitude: stage.longitude,
      locationLabel: stage.lieuLabel,
      sessionLabel: getDisplaySession(stage) ? formatSessionRange(getDisplaySession(stage)) : 'Date à confirmer',
      priceLabel: formatMapPrice(stage.prixParPersonne),
      url: `/stages-escalade/${stage.slug}`,
    })),
)

const stagesWithoutCoordinatesCount = computed(
  () => filteredAventures.value.length - mapStages.value.length,
)

const mapLegend = [
  { value: 'FALAISE', label: 'Falaise', letter: 'F', color: 'bg-[#d65245]' },
  { value: 'GRANDE_VOIE', label: 'Grande voie', letter: 'G', color: 'bg-[#b86b2f]' },
  { value: 'BLOC', label: 'Bloc', letter: 'B', color: 'bg-[#4f9fcf]' },
  { value: 'TRAD', label: 'Terrain d\'aventure', letter: 'T', color: 'bg-[#202020]' },
  { value: 'VIA_FERRATA', label: 'Via ferrata', letter: 'V', color: 'bg-[#6b8e23]' },
]


</script>

<template>
  <div class="bg-brand-950">
    <!-- Header réutilisable -->
    <AppHeader />

    <div class="relative pt-32 isolate overflow-hidden bg-brand-950 pt-14">
      
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <picture class="absolute inset-0 -z-10 block size-full">
          <source
            type="image/webp"
            srcset="/images/optimized/falaise-calanques2-480.webp 480w, /images/optimized/falaise-calanques2-768.webp 768w, /images/optimized/falaise-calanques2-1024.webp 1024w, /images/optimized/falaise-calanques2-1440.webp 1440w, /images/optimized/falaise-calanques2-1920.webp 1920w"
            sizes="100vw"
          />
          <img
            src="/images/falaise-Calanques2.jpg"
            alt="Stages d'escalade par les moniteurs de la Brigade du kiff"
            class="size-full object-cover opacity-30"
            width="4000"
            height="1848"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
        </picture>
        <section class="relative isolate overflow-hidden py-24 sm:py-20">
          <div class="absolute inset-0 -z-10"></div>
          <div class="max-w-5xl space-y-6">
            <h1 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
              Embarque pour ta prochaine aventure d'escalade
            </h1>
            <p class="text-base text-brand-100/80">
              Choisis un stage, inscris-toi et entre directement en contact avec la monitrice ou le moniteur de l’aventure. Tu organises ton séjour et tu comptes les dodos jusqu’au départ 🤩
            </p>
          </div>
        </section>
      </div>
    </div>
    <div class="mx-auto max-w-7xl px-6 py-14 lg:px-8 space-y-10 pb-16">

      <div v-if="pending" class="text-sm text-brand-100/70">
        Chargement des aventures...
      </div>

      <div v-else-if="error" class="text-sm text-red-400">
        Impossible de charger les aventures.
      </div>

      <div v-else class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Mode d’affichage</p>
          <div class="inline-flex rounded-2xl border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              class="rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition"
              :class="activeView === 'list'
                ? 'bg-secondaryBrand-500 text-brand-950'
                : 'text-brand-100/75 hover:text-white'"
              @click="activeView = 'list'"
            >
              Liste
            </button>
            <button
              type="button"
              class="rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition"
              :class="activeView === 'map'
                ? 'bg-secondaryBrand-500 text-brand-950'
                : 'text-brand-100/75 hover:text-white'"
              @click="activeView = 'map'"
            >
              Carte
            </button>
          </div>
        </div>

        <section class="mb-6 border-b border-white/10 pb-6">
          <div class="rounded-2xl border border-white/15 bg-brand-900/50 p-3 shadow-lg shadow-black/30 backdrop-blur">
            <div class="grid gap-4 lg:grid-cols-3 lg:items-stretch">
              <div class="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-brand-950/35 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Activité</p>
                  <button
                    v-if="selectedDiscipline"
                    type="button"
                    class="rounded-full border border-secondaryBrand-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 transition hover:bg-secondaryBrand-500/20"
                    @click="selectedDiscipline = null"
                  >
                    Réinitialiser
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="option in disciplineOptions"
                    :key="option.value"
                    type="button"
                    class="group flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition"
                    :class="selectedDiscipline === option.value
                      ? 'border-secondaryBrand-400 bg-secondaryBrand-500/20 text-white'
                      : 'border-brand-800 bg-brand-900/80 text-brand-100'"
                    @click="selectedDiscipline = option.value"
                  >
                    <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondaryBrand-400/80 transition duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-secondaryBrand-500/40">
                      <img
                        :src="iconPathForDiscipline(option.value)"
                        :alt="option.label"
                        class="h-6 w-6 object-contain"
                        loading="lazy"
                      />
                    </span>
                    <span class="font-medium leading-tight">{{ option.label }}</span>
                  </button>
                </div>
              </div>

              <div class="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-brand-950/35 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Dates</p>
                  <button
                    v-if="hasDateRangeFilter"
                    type="button"
                    class="rounded-full border border-secondaryBrand-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 transition hover:bg-secondaryBrand-500/20"
                    @click="resetDateRange"
                  >
                    Réinitialiser
                  </button>
                </div>
                <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                  <label class="space-y-1">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100/70">Début</span>
                    <input
                      v-model="dateRangeStart"
                      type="date"
                      class="date-filter-input w-full rounded-xl border border-white/15 bg-brand-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-secondaryBrand-300"
                    />
                  </label>
                  <label class="space-y-1">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100/70">Fin</span>
                    <input
                      v-model="dateRangeEnd"
                      type="date"
                      :min="dateRangeStart || undefined"
                      class="date-filter-input w-full rounded-xl border border-white/15 bg-brand-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-secondaryBrand-300"
                    />
                  </label>
                </div>
              </div>

              <div class="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-brand-950/35 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Région</p>
                  <button
                    v-if="selectedRegion"
                    type="button"
                    class="rounded-full border border-secondaryBrand-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 transition hover:bg-secondaryBrand-500/20"
                    @click="selectedRegion = null"
                  >
                    Réinitialiser
                  </button>
                </div>
                <select
                  v-model="selectedRegion"
                  class="w-full rounded-xl border border-white/15 bg-brand-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-secondaryBrand-300"
                >
                  <option :value="null">Toutes les régions</option>
                  <option
                    v-for="option in regionOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <p v-if="!regionOptions.length" class="text-xs text-brand-200/70">
                  Les régions apparaîtront dès que les stages auront des coordonnées GPS.
                </p>
              </div>
            </div>
            <p v-if="!disciplineOptions.length" class="mt-3 text-xs text-brand-200/70">
              Les activités apparaîtront dès que des aventures seront publiées.
            </p>
          </div>
        </section>

        <div v-if="activeView === 'map'" class="space-y-5">
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Carte des stages</p>
              </div>
              <div class="flex flex-wrap gap-3">
                <span
                  v-for="item in mapLegend"
                  :key="item.value"
                  class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-brand-950/70 px-3 py-1.5 text-xs text-white"
                >
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                    :class="item.color"
                  >
                    {{ item.letter }}
                  </span>
                  {{ item.label }}
                </span>
              </div>
            </div>

            <div v-if="mapStages.length" class="mt-5 overflow-hidden rounded-3xl ring-1 ring-white/10">
              <StagesMap :stages="mapStages" />
            </div>

            <p v-else class="mt-5 rounded-2xl border border-white/10 bg-brand-950/60 px-4 py-3 text-sm text-brand-100/80">
              Aucun stage filtré n’a encore de coordonnées GPS.
            </p>

            <p
              v-if="mapStages.length && stagesWithoutCoordinatesCount > 0"
              class="mt-4 text-sm text-brand-200/75"
            >
              {{ stagesWithoutCoordinatesCount }} stage<span v-if="stagesWithoutCoordinatesCount > 1">s</span> filtré<span v-if="stagesWithoutCoordinatesCount > 1">s</span>
              n’apparaît<span v-if="stagesWithoutCoordinatesCount > 1">ssent</span> pas encore sur la carte faute de coordonnées GPS.
            </p>
          </div>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2">
          <NuxtLink
            v-for="a in filteredAventures"
            :key="a.id"
            :to="`/stages-escalade/${a.slug}`"
            class="block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-3xl hover:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
          >
            <div class="relative h-72 w-full overflow-hidden">
              <img
                :src="stageCoverSrc(a)"
                :srcset="stageCoverSrcset(a)"
                :alt="a.titre"
                class="size-full object-cover transition duration-500 hover:scale-105"
                decoding="async"
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
              />
              <StageSoldOutRibbon v-if="a.estComplet" />
              <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent"></div>
              <div class="absolute inset-0 flex flex-col justify-between px-6 py-6 text-white">
                <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
                  <div class="flex flex-wrap items-center gap-3 flex-1">
                    <span class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20">
                      {{ formatDisciplineLabel(a.discipline) }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {{ formatDurationDays(a.jours) }}
                    </span>
                  </div>
                  <div class="ml-auto">
                    <span
                      class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/30 sm:h-14 sm:w-14"
                    >
                      <img
                        :src="iconPathForDiscipline(a.discipline)"
                        :alt="formatDisciplineLabel(a.discipline)"
                        class="h-8 w-8 object-contain sm:h-10 sm:w-10"
                      />
                    </span>
                  </div>
                </div>

                <div class="flex flex-col gap-3">
                  <h2 class="text-2xl font-semibold truncate">{{ a.titre }}</h2>
                  <p v-if="a.sousTitre" class="text-sm text-brand-100/80">{{ a.sousTitre }}</p>
                </div>
                <div class="flex flex-col gap-1 text-sm text-white">
                  <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                    <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {{ getDisplaySession(a) ? formatSessionRange(getDisplaySession(a)) : 'Date à confirmer' }}
                  </span>
                  <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                    <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                      <circle cx="12" cy="11" r="2.3" />
                    </svg>
                    {{ a.lieuLabel }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-1 flex-col p-5">
              <div class="flex items-center justify-between text-sm text-white">
                <div class="flex items-center gap-3 text-sm text-brand-100/80">
                  <img
                    :src="guideAvatarSrc(a)"
                    :srcset="guideAvatarSrcset(a)"
                    :alt="a.guideName || getGuideRoleLabel(a.guideGender, { capitalized: true })"
                    class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
                    decoding="async"
                    sizes="40px"
                    loading="lazy"
                  />
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                      {{ getGuideRoleLabel(a.guideGender, { capitalized: true }) }}
                    </p>
                    <p class="font-semibold text-white">
                      {{ a.guideName || `${getGuideRoleLabel(a.guideGender, { capitalized: true })} local${a.guideGender === 'female' ? 'e' : ''}` }}
                    </p>
                  </div>
                </div>
                <span class="font-semibold text-right">
                  {{ a.prixParPersonne }} € <span class="text-brand-200 text-xs">/ pers</span>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-if="!filteredAventures.length" class="text-sm text-brand-200/80">
          Pas d’aventures qui correspondent à ces filtres pour le moment. Essaie d’élargir ta recherche 😉
        </p>
      </div>
    </div>
  </div>

  <!-- Footer réutilisable -->
  <AppFooter />
</template>

<style scoped>
:deep(.dp-no-time-toggle .dp__open_time_picker_btn) {
  display: none !important;
}
:deep(.dp-no-time-toggle [data-test-id="open-time-picker-btn"]) {
  display: none !important;
}
:deep(.dp-no-time-toggle .dp--tp-wrap .dp__button) {
  display: none !important;
}
:deep(.date-filter-input::-webkit-calendar-picker-indicator) {
  cursor: pointer;
  filter: invert(1);
  opacity: 0.9;
}
</style>

<style>
:global(.dp__open_time_picker_btn),
:global([data-test-id="open-time-picker-btn"]),
:global(.dp--tp-wrap .dp__button) {
  display: none !important;
}
:global(.date-filter-input::-webkit-calendar-picker-indicator) {
  cursor: pointer;
  filter: invert(1);
  opacity: 0.9;
}
</style>
