<template>
  <div class="relative isolate min-h-screen overflow-hidden bg-brand-950 text-white">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <img
        :src="heroBackground"
        :srcset="heroBackgroundSrcset"
        alt=""
        class="h-full w-full object-cover opacity-25"
        decoding="async"
        sizes="100vw"
        loading="eager"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-950/90 to-brand-950" />
      <svg
        class="absolute top-0 left-[max(50%,25rem)] h-[48rem] w-[90rem] -translate-x-1/2 mask-[radial-gradient(64rem_64rem_at_top,transparent_5%,black)] stroke-brand-800/70"
        aria-hidden="true"
      >
        <defs>
          <pattern id="moniteur-grid" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" class="overflow-visible fill-brand-900/40">
          <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" stroke-width="0" />
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#moniteur-grid)" />
      </svg>
    </div>

    <div class="relative z-10 flex min-h-screen flex-col pt-24 sm:pt-32">
      <AppHeader />

      <main class="flex-1">
        <section class="px-6 py-24 sm:py-20 lg:px-0">

          <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
          <div class="grid grid-cols-1 gap-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div class="order-2 lg:order-1 lg:pr-4">
              <div class="lg:max-w-lg">
                <h1 class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                  {{ moniteurName || 'Moniteur local' }}
                </h1>
                <div class="mt-6 max-w-xl text-base/7 text-gray-300 sm:text-lg/8">
                  <p class="whitespace-pre-line">
                    {{ moniteurBioText }}
                  </p>
                  <button
                    v-if="moniteurHasLongBio"
                    type="button"
                    class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200 transition hover:text-secondaryBrand-100"
                    @click="showFullBio = !showFullBio"
                  >
                    {{ showFullBio ? 'Voir moins' : 'Voir plus' }}
                    <svg
                      class="h-4 w-4 transition"
                      :class="showFullBio ? 'rotate-180' : ''"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
                <div class="mt-8 flex flex-wrap gap-3">
                  <span
                    v-for="discipline in disciplineChips"
                    :key="discipline.value"
                    class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondaryBrand-100 ring-1 ring-secondaryBrand-300/40"
                  >
                    <img
                      :src="iconPathForDiscipline(discipline.value)"
                      :alt="discipline.label"
                      class="h-12 w-12 object-contain"
                    />
                    {{ discipline.label }}
                  </span>
                </div>
                <div class="mt-10 max-w-xl text-base/7 text-gray-300 lg:max-w-lg">
                  <ul role="list" class="space-y-8 text-gray-300">
                    <li
                      v-for="feature in featureList"
                      :key="feature.title"
                      class="flex gap-x-3"
                    >
                      <component :is="feature.icon" class="mt-1 size-5 flex-none text-secondaryBrand-300" aria-hidden="true" />
                      <span>
                        <strong class="font-semibold text-white">{{ feature.title }}.</strong>
                        {{ feature.description }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="order-1 lg:order-2 -mt-16 lg:mt-0 lg:sticky lg:top-4 lg:justify-self-end">
              <div class="rounded-3xl bg-white/5 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 lg:max-w-[34rem] xl:max-w-[36rem]">
                <img
                  class="w-full max-h-[44rem] rounded-2xl bg-gray-800 object-cover"
                  :src="moniteurPortrait"
                  :srcset="moniteurPortraitSrcset"
                  :alt="seoTitle"
                  decoding="async"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  loading="lazy"
                />
                <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <NuxtLink
                    v-if="moniteurWebsiteUrl"
                    :to="moniteurWebsiteUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-secondaryBrand-300 hover:text-secondaryBrand-200"
                  >
                    Carte professionnelle
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 11l8-8M16 3h5v5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                    </svg>
                  </NuxtLink>
                  <NuxtLink
                    v-if="moniteurInstagramUrl"
                    :to="moniteurInstagramUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-secondaryBrand-300 hover:text-secondaryBrand-200"
                  >
                    Instagram
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="4" y="4" width="16" height="16" rx="4" />
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="16.5" cy="7.5" r="1" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="aventures" class="relative isolate pb-20">
        <div class="mx-auto max-w-7xl px-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Stages & aventures</p>
              <h2 class="mt-2 text-3xl font-semibold text-pretty text-white">Les propositions de {{ moniteurName || 'notre moniteur' }}</h2>
              <p class="mt-3 text-base text-gray-300">Découvre les prochains séjours imaginés par {{ moniteurName || 'ce guide' }}.</p>
            </div>
            <NuxtLink
              to="/aventures-escalade"
              class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white hover:text-white"
            >
              Voir toutes les aventures
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
              </svg>
            </NuxtLink>
          </div>

          <div v-if="pending" class="mt-12 grid gap-8 lg:grid-cols-2">
            <div v-for="n in 2" :key="n" class="h-64 animate-pulse rounded-3xl bg-white/5" />
          </div>

          <div v-else-if="filteredAventures.length" class="mt-12 grid gap-6 lg:grid-cols-2">
            <NuxtLink
              v-for="aventure in filteredAventures"
              :key="aventure.id"
              :to="`/aventures-escalade/${aventure.slug}`"
              class="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition hover:-translate-y-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
            >
              <div class="relative h-72 w-full overflow-hidden">
                <img
                  :src="aventureCoverSrc(aventure)"
                  :srcset="aventureCoverSrcset(aventure)"
                  :alt="aventure.titre"
                  class="size-full object-cover transition duration-500 hover:scale-105"
                  decoding="async"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent"></div>
                <div class="absolute inset-0 flex flex-col justify-between px-6 py-6 text-white">
                  <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
                    <div class="flex flex-wrap items-center gap-3 flex-1">
                      <span class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20">
                        {{ formatDisciplineLabel(aventure.discipline) }}
                      </span>
                      <span class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        {{ aventure.jours }} {{ aventure.jours > 1 ? 'jours' : 'jour' }}
                      </span>
                    </div>
                    <div class="ml-auto">
                      <span
                        class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/30 sm:h-14 sm:w-14"
                      >
                        <img
                          :src="iconPathForDiscipline(aventure.discipline)"
                          :alt="formatDisciplineLabel(aventure.discipline)"
                          class="h-8 w-8 object-contain sm:h-10 sm:w-10"
                        />
                      </span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-3">
                    <h2 class="text-2xl font-semibold truncate">{{ aventure.titre }}</h2>
                    <p v-if="aventure.sousTitre" class="text-sm text-brand-100/80">{{ aventure.sousTitre }}</p>
                  </div>

                  <div class="flex flex-col gap-1 text-sm text-white">
                    <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                      <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {{ aventure.nextSession ? formatSessionRange(aventure.nextSession) : 'Date à confirmer' }}
                    </span>
                    <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                      <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                        <circle cx="12" cy="11" r="2.3" />
                      </svg>
                      {{ aventure.lieuLabel }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-center justify-between text-sm text-white">
                  <div class="flex items-center gap-3 text-sm text-brand-100/80">
                    <img
                      :src="moniteurPortrait || fallbackImageForDiscipline(aventure.discipline)"
                      :srcset="moniteurPortraitSrcset"
                      :alt="moniteurName || 'Moniteur'"
                      class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
                      decoding="async"
                      sizes="40px"
                      loading="lazy"
                    />
                    <div>
                      <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                        Moniteur
                      </p>
                      <p class="font-semibold text-white">
                        {{ moniteurName || 'Moniteur local' }}
                      </p>
                    </div>
                  </div>
                  <span class="font-semibold text-right">
                    {{ aventure.prixParPersonne }} € <span class="text-brand-200 text-xs">/ pers</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else-if="!pending" class="mt-12 rounded-3xl border border-dashed border-white/20 p-12 text-center text-gray-300">
            <p>
              Ce moniteur n’a pas encore publié d’aventures. Reviens bientôt ou contacte-nous pour imaginer un séjour sur-mesure.
            </p>
          </div>

          <div v-if="error" class="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
            Impossible de charger les données du moniteur pour le moment.
          </div>
        </div>
        </section>
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, TruckIcon } from '@heroicons/vue/24/solid'
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data, pending, error } = await useAsyncData(
  () => $fetch(`/api/moniteurs/${slug.value}`),
  {
    watch: [() => slug.value],
  },
)

const moniteur = computed(() => data.value?.moniteur ?? null)
const aventures = computed(() => data.value?.aventures ?? [])
const filteredAventures = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const list = (aventures.value || []).map((a: any) => {
    const nextDate = a.nextSession?.dateDebut ? new Date(a.nextSession.dateDebut).getTime() : null
    const hasSessions = Array.isArray(a.sessions) && a.sessions.length > 0
    return { ...a, nextDate, hasSessions }
  })
  return list
    .filter((a: any) => {
      if (a.nextDate) return a.nextDate >= today.getTime()
      if (a.hasSessions) return false
      return true
    })
    .sort((a: any, b: any) => {
      if (a.nextDate && b.nextDate) return a.nextDate - b.nextDate
      if (a.nextDate && !b.nextDate) return -1
      if (!a.nextDate && b.nextDate) return 1
      return 0
    })
})

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Trad',
  VIA_FERRATA: 'Via ferrata',
}

const disciplineIconMap: Record<string, string> = {
  GRANDE_VOIE: '/images/grande-voie-white.png',
  FALAISE: '/images/couenne-white.png',
  BLOC: '/images/bloc-white.png',
  TRAD: '/images/trad-white.png',
  VIA_FERRATA: '/images/via-ferrata-white.svg',
}

const disciplineImageMap: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
  VIA_FERRATA: '/images/rappel-Calanques.jpg',
}

const iconPathForDiscipline = (value?: string | null) => {
  if (!value) return disciplineIconMap.GRANDE_VOIE
  return disciplineIconMap[value] ?? disciplineIconMap.GRANDE_VOIE
}

const fallbackImageForDiscipline = (value?: string | null) => {
  if (!value) return disciplineImageMap.GRANDE_VOIE
  return disciplineImageMap[value] ?? disciplineImageMap.GRANDE_VOIE
}

const formatDisciplineLabel = (value?: string | null) => {
  if (!value) return 'Discipline'
  return disciplineLabels[value] ?? value.replace(/_/g, ' ')
}

const moniteurName = computed(() => {
  const fullName = moniteur.value?.fullName?.trim()
  if (fullName) return fullName
  const composed = [moniteur.value?.firstName, moniteur.value?.lastName].filter(Boolean).join(' ').trim()
  return composed || null
})
const showFullBio = ref(false)
const moniteurBioValue = computed(() => moniteur.value?.bio?.trim() || '')
const moniteurBioFallback = computed(() => {
  const disciplines = disciplineChips.value.map((d) => d.label).join(' • ')
  if (disciplines) {
    return `${disciplines} — ${locationLabel.value}`
  }
  return `Escalade locale — ${locationLabel.value}`
})
const moniteurBioPreview = computed(() => {
  const bio = moniteurBioValue.value
  if (!bio) return moniteurBioFallback.value
  return bio.length > 520 ? `${bio.slice(0, 520).trimEnd()}…` : bio
})
const moniteurBioFull = computed(() => moniteurBioValue.value || moniteurBioFallback.value)
const moniteurHasLongBio = computed(() => moniteurBioValue.value.length > 520)
const moniteurBioText = computed(() => (showFullBio.value ? moniteurBioFull.value : moniteurBioPreview.value))
const moniteurPortrait = computed(() => {
  const src = resolveStoredImageSrc(moniteur.value?.profileImageUrl, moniteur.value?.profileImageVariants)
  if (src) return src
  return heroBackground.value || '/images/escalade-grande-voie-calanques.jpg'
})
const moniteurPortraitSrcset = computed(() => buildStoredSrcset(moniteur.value?.profileImageVariants))
const heroBackground = computed(
  () => resolveStoredImageSrc(moniteur.value?.heroImageUrl, moniteur.value?.heroImageVariants) || fallbackImageForDiscipline(),
)
const heroBackgroundSrcset = computed(() => buildStoredSrcset(moniteur.value?.heroImageVariants))
const locationLabel = computed(() => moniteur.value?.baseLocation || moniteur.value?.department || 'France')

const aventureCoverSrc = (aventure: any) => {
  return resolveStoredImageSrc(aventure?.coverImageUrl, aventure?.coverImageVariants) || fallbackImageForDiscipline(aventure?.discipline)
}

const aventureCoverSrcset = (aventure: any) => {
  return buildStoredSrcset(aventure?.coverImageVariants)
}

useHead({
  titleTemplate: '%s',
})

const seoTitle = computed(() => {
  const fullName = moniteurName.value
  return fullName
    ? `${fullName}, moniteur d'escalade de la Brigade du kiff`
    : "Moniteur d'escalade de la Brigade du kiff"
})
const seoDescription = computed(
  () =>
    moniteur.value?.bio?.slice(0, 155) ||
    'Collectif de moniteurs diplômés proposant des stages d’escalade outdoor.',
)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: moniteurPortrait,
  robots: 'index, follow, max-image-preview:large',
})

const moniteurWebsiteUrl = computed(() => {
  const card = moniteur.value?.professionalCardNumber || moniteur.value?.guideProfile?.professionalCardNumber
  if (card) {
    return `https://recherche-educateur.sports.gouv.fr/CartePro/${card}`
  }
  
  return null
})

const moniteurInstagramUrl = computed(() => {
  return (
    moniteur.value?.guideProfile?.instagramUrl ||
    moniteur.value?.profile?.instagramUrl ||
    null
  )
})

const disciplineChips = computed(() => {
  const disciplines = moniteur.value?.disciplines ?? []
  if (!disciplines.length && aventures.value.length) {
    return Array.from(new Set(aventures.value.map((a: any) => a.discipline).filter(Boolean))).map((value: string) => ({
      value,
      label: formatDisciplineLabel(value),
    }))
  }
  return disciplines.map((value: string) => ({
    value,
    label: formatDisciplineLabel(value),
  }))
})


const nextSessionLabel = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()

  const candidates: number[] = []
  for (const a of aventures.value || []) {
    if (a?.nextSession?.dateDebut) {
      const ts = new Date(a.nextSession.dateDebut).getTime()
      if (!Number.isNaN(ts) && ts >= todayMs) candidates.push(ts)
    }
    if (Array.isArray(a?.sessions)) {
      for (const s of a.sessions) {
        if (!s?.dateDebut) continue
        const ts = new Date(s.dateDebut).getTime()
        if (!Number.isNaN(ts) && ts >= todayMs) candidates.push(ts)
      }
    }
  }
  if (candidates.length) {
    const nextTs = Math.min(...candidates)
    return formatFullDate(nextTs)
  }

  const stats = moniteur.value?.stats
  if (stats?.prochaineDate) {
    const ts = new Date(stats.prochaineDate).getTime()
    if (!Number.isNaN(ts) && ts >= todayMs) {
      return formatFullDate(ts)
    }
  }
  return 'Sur demande'
})

const aventuresCountLabel = computed(() => {
  const stats = moniteur.value?.stats
  const count = stats?.aventuresPubliees ?? aventures.value.length
  if (!count) return 'Bientôt disponible'
  return `${count} aventure${count > 1 ? 's' : ''}`
})

const featureList = computed(() => [
  {
    icon: HomeIcon,
    title: 'Camp de base',
    description: locationLabel.value,
  },
  {
    icon: TruckIcon,
    title: 'Prochain départ',
    description: nextSessionLabel.value,
  },
])


const formatFullDate = (dateInput: string | number | Date) => {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatter.format(new Date(dateInput))
}

const formatSessionRange = (session?: { dateDebut?: string | Date; dateFin?: string | Date } | null) => {
  if (!session?.dateDebut) return 'Dates à confirmer'
  const start = formatFullDate(session.dateDebut)
  if (!session.dateFin) return start
  const end = formatFullDate(session.dateFin)
  return start === end ? start : `${start} → ${end}`
}

const formatPrice = (value?: number | null) => {
  if (!value) return 'Tarif sur demande'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>
