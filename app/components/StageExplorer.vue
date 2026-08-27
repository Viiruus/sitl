<script setup lang="ts">
import { formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { getPublicFutureSessionThresholdMs } from '~~/shared/utils/public-stage-sessions'
import { getStageRegionForCoordinates } from '~~/shared/utils/stage-region'

const route = useRoute()
const router = useRouter()
const { data, pending, error } = await useFetch('/api/aventures')
const { loggedIn, user, fetch: fetchUserSession } = useUserSession()
const { openModal } = useAuthModal()

const selectedDisciplines = ref<string[]>([])
const selectedRegion = ref<string | null>(null)
const dateRangeStart = ref('')
const dateRangeEnd = ref('')
const activeView = ref<'list' | 'map'>('list')
const notificationLoading = ref(false)
const notificationError = ref<string | null>(null)
const notificationSuccess = ref<string | null>(null)
const pendingStageNotificationKey = 'bdk_pending_stage_notification'
const disciplineQueryAliases: Record<string, string> = {
  TERRAIN_AVENTURE: 'TRAD',
}

const normalizeDisciplineFilter = (value?: string | null) => {
  if (!value) return null
  const normalized = value.toUpperCase()
  return disciplineQueryAliases[normalized] ?? normalized
}

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

const toggleDiscipline = (value: string) => {
  selectedDisciplines.value = selectedDisciplines.value.includes(value)
    ? selectedDisciplines.value.filter(discipline => discipline !== value)
    : [...selectedDisciplines.value, value]
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
    const region = getStageRegionForCoordinates(aventure.latitude, aventure.longitude)
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

const initialQueryDiscipline = route.query.discipline
const initialQueryDisciplines = Array.isArray(initialQueryDiscipline)
  ? initialQueryDiscipline
  : typeof initialQueryDiscipline === 'string'
    ? initialQueryDiscipline.split(',')
    : []
selectedDisciplines.value = initialQueryDisciplines
  .map(value => normalizeDisciplineFilter(value))
  .filter((value): value is string => Boolean(value))

const initialQueryRegion = route.query.region
if (typeof initialQueryRegion === 'string') {
  selectedRegion.value = initialQueryRegion
}

const initialQueryDateStart = route.query.dateStart
if (typeof initialQueryDateStart === 'string') {
  dateRangeStart.value = initialQueryDateStart
}

const initialQueryDateEnd = route.query.dateEnd
if (typeof initialQueryDateEnd === 'string') {
  dateRangeEnd.value = initialQueryDateEnd
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
  const thresholdMs = getPublicFutureSessionThresholdMs()

  let adventures = publishedAventures.value
    .map((aventure: any) => {
      const nextDate = aventure.nextSession?.dateDebut ? new Date(aventure.nextSession.dateDebut).getTime() : null
      const hasSessions = Array.isArray(aventure.sessions) && aventure.sessions.length > 0
      return { ...aventure, nextDate, hasSessions }
    })
    .filter((aventure: any) => {
      if (aventure.nextDate) {
        return aventure.nextDate >= thresholdMs
      }
      return false
    })

  if (selectedDisciplines.value.length) {
    adventures = adventures.filter(
      (aventure) => selectedDisciplines.value.includes(aventure.discipline)
    )
  }

  if (hasDateRangeFilter.value) {
    adventures = adventures.filter((aventure: any) =>
      getUpcomingSessions(aventure).some(sessionOverlapsSelectedDateRange),
    )
  }

  if (selectedRegion.value) {
    adventures = adventures.filter((aventure: any) => {
      const region = getStageRegionForCoordinates(aventure.latitude, aventure.longitude)
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

const currentNotificationCriteria = computed(() => ({
  disciplines: [...selectedDisciplines.value],
  region: selectedRegion.value,
  dateStart: dateRangeStart.value || null,
  dateEnd: dateRangeEnd.value || null,
}))

const getFetchErrorMessage = (e: any, fallback: string) =>
  e?.data?.message || e?.data?.statusMessage || e?.statusMessage || e?.message || fallback

const storePendingStageNotification = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    pendingStageNotificationKey,
    JSON.stringify({
      path: route.fullPath,
      criteria: currentNotificationCriteria.value,
      createdAt: Date.now(),
    }),
  )
}

const applyNotificationCriteria = (criteria: any) => {
  if (!criteria || typeof criteria !== 'object') return
  selectedDisciplines.value = Array.isArray(criteria.disciplines)
    ? criteria.disciplines.filter((discipline: unknown): discipline is string => typeof discipline === 'string')
    : typeof criteria.discipline === 'string'
      ? [criteria.discipline]
      : []
  selectedRegion.value = typeof criteria.region === 'string' ? criteria.region : null
  dateRangeStart.value = typeof criteria.dateStart === 'string' ? criteria.dateStart : ''
  dateRangeEnd.value = typeof criteria.dateEnd === 'string' ? criteria.dateEnd : ''
}

const clearNotifyStagesQuery = async () => {
  if (!route.query.notifyStages) return
  const nextQuery = { ...route.query }
  delete nextQuery.notifyStages
  await router.replace({ path: route.path, query: nextQuery })
}

const subscribeToStageNotifications = async (options: { fromPending?: boolean } = {}) => {
  notificationError.value = null
  notificationSuccess.value = null
  notificationLoading.value = true

  try {
    const disciplines = selectedDisciplines.value.length ? selectedDisciplines.value : [null]
    const responses: any[] = await Promise.all(
      disciplines.map(discipline => $fetch('/api/stage-notification-subscriptions', {
        method: 'POST',
        body: {
          discipline,
          region: selectedRegion.value,
          dateStart: dateRangeStart.value || null,
          dateEnd: dateRangeEnd.value || null,
        },
      })),
    )

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(pendingStageNotificationKey)
    }

    notificationSuccess.value = responses.every(response => response?.already)
      ? 'Tu es déjà inscrit·e à ces notifications.'
      : 'C’est noté, tu seras prévenu·e sur WhatsApp.'
    if (options.fromPending) {
      await clearNotifyStagesQuery()
    }
  } catch (e: any) {
    notificationError.value = getFetchErrorMessage(e, 'Impossible d’enregistrer cette alerte.')
  } finally {
    notificationLoading.value = false
  }
}

const handleStageNotificationClick = async () => {
  await fetchUserSession()

  if (!loggedIn.value) {
    storePendingStageNotification()
    openModal()
    return
  }

  if (user.value?.role === 'GUIDE') {
    notificationError.value = 'Connecte-toi avec un compte grimpeur pour recevoir ces notifications.'
    notificationSuccess.value = null
    return
  }

  if (!user.value?.onboarded) {
    storePendingStageNotification()
    await router.push('/onboarding')
    return
  }

  await subscribeToStageNotifications()
}

onMounted(async () => {
  if (route.query.notifyStages !== '1' || typeof window === 'undefined') return

  const raw = window.localStorage.getItem(pendingStageNotificationKey)
  if (!raw) {
    await clearNotifyStagesQuery()
    return
  }

  try {
    const payload = JSON.parse(raw)
    applyNotificationCriteria(payload?.criteria)
    await fetchUserSession()
    if (loggedIn.value && user.value?.role !== 'GUIDE' && user.value?.onboarded) {
      await subscribeToStageNotifications({ fromPending: true })
    }
  } catch {
    window.localStorage.removeItem(pendingStageNotificationKey)
    await clearNotifyStagesQuery()
  }
})
</script>

<template>
  <section id="stages" class="w-full bg-brand-950">
    <div
      class="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-10 pb-14 sm:px-6 lg:px-8"
    >

      <div v-if="pending" class="text-sm text-brand-100/70">
        Chargement des aventures...
      </div>

      <div v-else-if="error" class="text-sm text-red-400">
        Impossible de charger les aventures.
      </div>

      <div v-else class="space-y-4">
        <section class="mb-3">
          <div class="grid overflow-hidden rounded-2xl bg-white/95 p-2 text-left shadow-2xl shadow-black/30 backdrop-blur lg:grid-cols-[1.6fr_1.2fr_0.9fr] lg:items-stretch">
            <div class="flex min-w-0 items-center gap-3 border-b border-gray-200 px-3 py-2.5 lg:border-r lg:border-b-0 lg:px-4">
              <svg class="size-6 shrink-0 text-secondaryBrand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="m3 19 6.5-10 3.5 5 2.5-4L21 19H3Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 19h14" />
              </svg>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-brand-950">Activités</span>
                  <button
                    v-if="selectedDisciplines.length"
                    type="button"
                    class="text-[10px] font-semibold text-secondaryBrand-600 transition hover:text-secondaryBrand-500"
                    @click="selectedDisciplines = []"
                  >
                    Effacer
                  </button>
                </div>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    v-for="option in disciplineOptions"
                    :key="option.value"
                    type="button"
                    class="group inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium transition"
                    :class="selectedDisciplines.includes(option.value)
                      ? 'border-secondaryBrand-400 bg-secondaryBrand-50 text-brand-950 shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-secondaryBrand-400 hover:bg-secondaryBrand-50'"
                    :aria-pressed="selectedDisciplines.includes(option.value)"
                    @click="toggleDiscipline(option.value)"
                  >
                    <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondaryBrand-400">
                      <img
                        :src="iconPathForDiscipline(option.value)"
                        alt=""
                        class="size-[18px] object-contain"
                        loading="lazy"
                      />
                    </span>
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>

            <div class="flex min-w-0 items-center gap-3 border-b border-gray-200 px-3 py-2.5 lg:border-r lg:border-b-0 lg:px-4">
              <svg class="size-6 shrink-0 text-secondaryBrand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path stroke-linecap="round" d="M8 3v4M16 3v4M3 10h18" />
              </svg>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-brand-950">Dates</span>
                  <button
                    v-if="hasDateRangeFilter"
                    type="button"
                    class="text-[10px] font-semibold text-secondaryBrand-600 transition hover:text-secondaryBrand-500"
                    @click="resetDateRange"
                  >
                    Effacer
                  </button>
                </div>
                <div class="mt-1 grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <label class="min-w-0">
                    <span class="sr-only">Date de début</span>
                    <input
                      v-model="dateRangeStart"
                      type="date"
                      class="date-filter-input w-full min-w-0 bg-transparent text-sm text-gray-600 outline-none"
                    />
                  </label>
                  <span class="text-xs text-gray-300">—</span>
                  <label class="min-w-0">
                    <span class="sr-only">Date de fin</span>
                    <input
                      v-model="dateRangeEnd"
                      type="date"
                      :min="dateRangeStart || undefined"
                      class="date-filter-input w-full min-w-0 bg-transparent text-sm text-gray-600 outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div class="flex min-w-0 items-center gap-3 border-b border-gray-200 px-3 py-2.5 lg:border-r lg:border-b-0 lg:px-4">
              <svg class="size-6 shrink-0 text-secondaryBrand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                <circle cx="12" cy="11" r="2.3" />
              </svg>
              <label class="min-w-0 flex-1">
                <span class="block text-xs font-semibold text-brand-950">Région</span>
                <select
                  v-model="selectedRegion"
                  class="mt-1 w-full cursor-pointer appearance-none bg-transparent pr-4 text-sm text-gray-600 outline-none"
                >
                  <option :value="null">Toutes les régions</option>
                  <option v-for="option in regionOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>

          </div>

          <div class="mt-3 mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-normal text-brand-100/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="notificationLoading"
                @click="handleStageNotificationClick"
              >
                <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17H9m10-2.5c-1.3-1.1-2-2.5-2-4.2V8a5 5 0 0 0-10 0v2.3c0 1.7-.7 3.1-2 4.2l-.5.4A1 1 0 0 0 5.1 17h13.8a1 1 0 0 0 .6-2.1l-.5-.4Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 20a2 2 0 0 0 4 0" />
                </svg>
                <span v-if="notificationLoading">Inscription en cours…</span>
                <span v-else>Je souhaite être notifié des prochains stages répondant à ces critères</span>
              </button>
              <p v-if="notificationSuccess" class="text-xs font-medium text-secondaryBrand-200">
                {{ notificationSuccess }}
              </p>
              <p v-else-if="notificationError" class="text-xs font-medium text-red-300">
                {{ notificationError }}
              </p>
            </div>

            <div class="flex items-center justify-between gap-3 sm:justify-end">
              <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-200/70">Mode d’affichage</p>
              <div class="inline-flex rounded-xl border border-white/15 bg-white/5 p-0.5">
                <button
                  type="button"
                  class="rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition"
                  :class="activeView === 'list'
                    ? 'bg-secondaryBrand-500 text-brand-950'
                    : 'text-brand-100/75 hover:text-white'"
                  @click="activeView = 'list'"
                >
                  Liste
                </button>
                <button
                  type="button"
                  class="rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition"
                  :class="activeView === 'map'
                    ? 'bg-secondaryBrand-500 text-brand-950'
                    : 'text-brand-100/75 hover:text-white'"
                  @click="activeView = 'map'"
                >
                  Carte
                </button>
              </div>
            </div>
          </div>
        </section>

        <div id="stage-results" v-if="activeView === 'map'" class="scroll-mt-28 space-y-5">
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

        <div id="stage-results" v-else class="scroll-mt-28 grid grid-cols-[repeat(auto-fill,minmax(min(100%,28rem),1fr))] gap-6">
          <StageCard
            v-for="a in filteredAventures"
            :key="a.id"
            :stage="a"
            :session="getDisplaySession(a)"
          />
        </div>

        <p v-if="!filteredAventures.length" class="text-sm text-brand-200/80">
          Pas d’aventures qui correspondent à ces filtres pour le moment. Essaie d’élargir ta recherche 😉
        </p>
      </div>
    </div>
  </section>
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
  filter: none;
  opacity: 0.65;
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
  filter: none;
  opacity: 0.65;
}
</style>
