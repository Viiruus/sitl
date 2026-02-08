<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { fr } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'
const route = useRoute()
const { data, pending, error } = await useFetch('/api/aventures')

const selectedDiscipline = ref<string | null>(null)
const dateRangeFilter = ref<[Date | null, Date | null] | null>(null)
const dateFilterFormats = {
  input: 'dd/MM/yyyy',
  preview: 'dd/MM/yyyy',
}

const frLocale = fr

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Trad',
  VIA_FERRATA: 'Via ferrata',
}

const formatDisciplineLabel = (value: string) => {
  return disciplineLabels[value] ?? value?.replace(/_/g, ' ') ?? 'Autre'
}

const disciplineOptions = computed(() => {
  const adventures = data.value?.aventures ?? []
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
  selectedDiscipline.value = initialQueryDiscipline.toUpperCase()
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

const formatSessionRange = (session: any) => {
  if (!session?.dateDebut || !session?.dateFin) return ''
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const start = formatter.format(new Date(session.dateDebut))
  const end = formatter.format(new Date(session.dateFin))
  return start === end ? start : `${start} → ${end}`
}

const filteredAventures = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let adventures = (data.value?.aventures ?? [])
    .map((aventure: any) => {
      const nextDate = aventure.nextSession?.dateDebut ? new Date(aventure.nextSession.dateDebut).getTime() : null
      const hasSessions = Array.isArray(aventure.sessions) && aventure.sessions.length > 0
      return { ...aventure, nextDate, hasSessions }
    })
    .filter((aventure: any) => {
      if (aventure.nextDate) {
        return aventure.nextDate >= today.getTime()
      }
      if (aventure.hasSessions) return false
      return true
    })

  if (selectedDiscipline.value) {
    adventures = adventures.filter(
      (aventure) => aventure.discipline === selectedDiscipline.value
    )
  }

  if (dateRangeFilter.value) {
    const [start, end] = dateRangeFilter.value
    const startTime = start ? new Date(start).setHours(0, 0, 0, 0) : null
    const endTime = end ? new Date(end).setHours(23, 59, 59, 999) : null
    if (startTime || endTime) {
      adventures = adventures.filter((aventure: any) => {
        const nextDate = aventure.nextDate ?? null
        if (!nextDate) return false
        if (startTime && nextDate < startTime) return false
        if (endTime && nextDate > endTime) return false
        return true
      })
    }
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


</script>

<template>
  <div class="bg-brand-950">
    <!-- Header réutilisable -->
    <AppHeader />

    <div class="relative pt-32 isolate overflow-hidden bg-brand-950 pt-14">
      
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <img 
          src="/images/falaise-Calanques2.jpg" 
          alt=""
          class="absolute inset-0 -z-10 size-full object-cover opacity-30"
        />
        <section class="relative isolate overflow-hidden py-24 sm:py-20">
          <div class="absolute inset-0 -z-10"></div>
          <div class="max-w-4xl space-y-6">
            <h1 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
              L’aventure escalade par et pour les meilleur·e·s
            </h1>
            <p class="text-base text-brand-100/80">
              Choisis un stage, inscris-toi et entre directement en contact avec la monitrice ou le moniteur de l’aventure.
              <br/>
              Tu organises ton séjour et tu pars à l’aventure. La Brigade du kiff, c’est l’assurance d’une expérience unique accompagnée par les meilleur·e·s.
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
        <section class="space-y-4 pb-8 mb-8 border-b border-white/10">
          <div class="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1.2fr)]">
            <div class="space-y-4 rounded-2xl border border-white/15 bg-brand-900/50 p-4 shadow-lg shadow-black/30 backdrop-blur">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Filtrer par discipline</p>
                <button
                  v-if="selectedDiscipline"
                  type="button"
                  class="rounded-full border border-secondaryBrand-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 transition hover:bg-secondaryBrand-500/20"
                  @click="selectedDiscipline = null"
                >
                  Réinitialiser
                </button>
              </div>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="option in disciplineOptions"
                  :key="option.value"
                  type="button"
                  class="group flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition"
                  :class="selectedDiscipline === option.value
                    ? 'border-secondaryBrand-400 bg-secondaryBrand-500/20 text-white'
                    : 'border-brand-800 bg-brand-900/80 text-brand-100'"
                  @click="selectedDiscipline = option.value"
                >
                  <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-secondaryBrand-400/80 transition duration-300 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-secondaryBrand-500/40 group-hover:rotate-1">
                    <img
                      :src="iconPathForDiscipline(option.value)"
                      :alt="option.label"
                      class="h-8 w-8 object-contain"
                      loading="lazy"
                    />
                  </span>
                  <span class="font-medium">{{ option.label }}</span>
                </button>
                <p v-if="!disciplineOptions.length" class="text-xs text-brand-200/70">
                  Les disciplines apparaîtront dès que des aventures seront publiées.
                </p>
              </div>
            </div>

            <div class="space-y-3 rounded-2xl border border-white/15 bg-brand-900/50 p-4 text-sm text-brand-100 shadow-lg shadow-black/30 backdrop-blur">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Filtrer par dates</p>
              </div>
              <ClientOnly>
                <VueDatePicker
                  class="dp-no-time-toggle"
                  v-model="dateRangeFilter"
                  range
                  :auto-apply="true"
                  :action-row="false"
                  :enable-time-picker="false"
                  :formats="dateFilterFormats"
                  :teleport="true"
                  :locale="frLocale"
                  placeholder="JJ/MM/AAAA → JJ/MM/AAAA"
                  input-class-name="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-secondaryBrand-400 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-400/40"
                  :disabled="pending"
                />
              </ClientOnly>
            </div>
          </div>
        </section>

        <div class="grid gap-6 md:grid-cols-2">
          <NuxtLink
            v-for="a in filteredAventures"
            :key="a.id"
            :to="`/aventures-escalade/${a.slug}`"
            class="block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-3xl hover:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
          >
            <div class="relative h-72 w-full overflow-hidden">
              <img
                :src="a.coverImageUrl || imageForDiscipline(a.discipline)"
                :alt="a.titre"
                class="size-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent"></div>
              <div class="absolute inset-0 flex flex-col justify-between px-6 py-6 text-white">
                <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
                  <div class="flex flex-wrap items-center gap-3 flex-1">
                    <span class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20">
                      {{ formatDisciplineLabel(a.discipline) }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {{ a.jours }} {{ a.jours > 1 ? 'jours' : 'jour' }}
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
                    {{ a.nextSession ? formatSessionRange(a.nextSession) : 'Date à confirmer' }}
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
                    :src="a.guideImageUrl || imageForDiscipline(a.discipline)"
                    :alt="a.guideName || 'Moniteur'"
                    class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
                  />
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                      Moniteur
                    </p>
                    <p class="font-semibold text-white">
                      {{ a.guideName || 'Moniteur local' }}
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
</style>

<style>
:global(.dp__open_time_picker_btn),
:global([data-test-id="open-time-picker-btn"]),
:global(.dp--tp-wrap .dp__button) {
  display: none !important;
}
</style>
