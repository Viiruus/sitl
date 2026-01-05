<template>
  <div class="relative isolate min-h-screen overflow-hidden bg-brand-950 text-white">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <img
        :src="heroBackground"
        alt=""
        class="h-full w-full object-cover opacity-25"
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
          <div class="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div class="lg:pr-4">
              <div class="lg:max-w-lg">
                <h1 class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                  {{ moniteurName || 'Moniteur local' }}
                </h1>
                <p class="mt-6 text-xl/8 text-gray-300">
                  {{ moniteurTagline }}
                </p>
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
                  <p class="mt-8">
                    {{ moniteurClosing }}
                  </p>
                  <h2 class="mt-16 text-2xl font-bold tracking-tight text-white">Les stages encadrés par {{ moniteurName || 'ton moniteur' }}</h2>
                  <p class="mt-6">
                    Découvre ci-dessous ses prochains stages et expériences escalade déjà imaginés pour les grimpeurs motivés.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-8 lg:mt-0 lg:sticky lg:top-4 lg:justify-self-end">
              <div class="rounded-3xl bg-white/5 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 lg:max-w-[34rem] xl:max-w-[36rem]">
                <img
                  class="w-full rounded-2xl bg-gray-800 object-cover"
                  :src="moniteurPortrait"
                  :alt="moniteurName || 'Portrait du moniteur'"
                />
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

          <div v-else-if="aventures.length" class="mt-12 grid gap-8 lg:grid-cols-2">
            <NuxtLink
              v-for="aventure in aventures"
              :key="aventure.id"
              :to="`/aventures-escalade/${aventure.slug}`"
              class="flex flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div class="relative">
                <img
                  :src="aventure.coverImageUrl || fallbackImageForDiscipline(aventure.discipline)"
                  :alt="aventure.titre"
                  class="h-60 w-full object-cover"
                />
                <span
                  class="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/40"
                >
                  <img
                    :src="iconPathForDiscipline(aventure.discipline)"
                    :alt="formatDisciplineLabel(aventure.discipline)"
                    class="h-7 w-7 object-contain"
                  />
                </span>
              </div>
              <div class="flex flex-1 flex-col gap-4 p-6">
                <div class="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                  <span class="rounded-full bg-brand-900/80 px-3 py-1">
                    {{ formatDisciplineLabel(aventure.discipline) }}
                  </span>
                  <span class="rounded-full border border-secondaryBrand-200/40 bg-secondaryBrand-500/20 px-3 py-1 tracking-wide text-secondaryBrand-100">
                    {{ aventure.jours }} {{ aventure.jours > 1 ? 'jours' : 'jour' }}
                  </span>
                </div>
                <div>
                  <p class="text-sm uppercase tracking-[0.3em] text-white/60">
                    {{ aventure.lieuLabel }}
                  </p>
                  <h3 class="mt-2 text-2xl font-semibold text-white">
                    {{ aventure.titre }}
                  </h3>
                  <p class="mt-2 text-base text-gray-300">
                    {{ aventure.sousTitre }}
                  </p>
                </div>
                <div class="mt-auto flex items-center justify-between text-sm text-white">
                  <span class="inline-flex items-center gap-2">
                    <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V5a4 4 0 1 1 8 0v2" />
                      <rect x="5" y="7" width="14" height="12" rx="2" />
                      <path stroke-linecap="round" d="M8 11h8" />
                    </svg>
                    {{ formatSessionRange(aventure.nextSession) }}
                  </span>
                  <span class="text-base font-semibold">
                    {{ formatPrice(aventure.prixParPersonne) }}
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
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/vue/20/solid'

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

useHead(() => {
  const title = moniteur.value?.fullName
    ? `${moniteur.value.fullName} | Moniteur d’escalade`
    : 'Moniteur d’escalade'
  return {
    title,
    meta: moniteur.value?.bio
      ? [
          {
            name: 'description',
            content: moniteur.value.bio.slice(0, 155),
          },
        ]
      : [],
  }
})

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Trad',
}

const disciplineIconMap: Record<string, string> = {
  GRANDE_VOIE: '/images/grande-voie.png',
  FALAISE: '/images/couenne.png',
  BLOC: '/images/bloc.png',
  TRAD: '/images/trad.png',
}

const disciplineImageMap: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
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

const moniteurName = computed(() => moniteur.value?.fullName || null)
const moniteurBio = computed(() => moniteur.value?.bio || 'Moniteur d’escalade passionné prêt à imaginer ta prochaine aventure en falaise.')
const moniteurShortBio = computed(() => {
  const bio = moniteur.value?.bio?.trim()
  if (!bio) return null
  return bio.length > 220 ? `${bio.slice(0, 220).trimEnd()}…` : bio
})
const moniteurBioLong = computed(() => {
  const bio = moniteur.value?.bio
  if (!bio) {
    return "Chaque aventure est pensée pour faire progresser le groupe sans oublier l’esprit de cordée : pédagogie, sécurité, bonnes adresses locales et convivialité."
  }
  return bio.length > 680 ? bio : bio
})
const normalizeImagePath = (src?: string | null) => {
  if (!src) return null
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }
  if (src.startsWith('/')) {
    return src
  }
  return `/images/${src.replace(/^(\.\/)+/, '')}`
}

const moniteurPortrait = computed(() => {
  const src = normalizeImagePath(moniteur.value?.profileImageUrl)
  if (src) return src
  return heroBackground.value || '/images/escalade-grande-voie-calanques.jpg'
})
const heroBackground = computed(() => normalizeImagePath(moniteur.value?.heroImageUrl) || fallbackImageForDiscipline())
const locationLabel = computed(() => moniteur.value?.baseLocation || moniteur.value?.department || 'France')

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

const moniteurTagline = computed(() => {
  if (moniteurShortBio.value) {
    return moniteurShortBio.value
  }
  const disciplines = disciplineChips.value.map((d) => d.label).join(' • ')
  if (disciplines) {
    return `${disciplines} — ${locationLabel.value}`
  }
  return `Escalade locale — ${locationLabel.value}`
})

const nextSessionLabel = computed(() => {
  const stats = moniteur.value?.stats
  if (stats?.prochaineDate) {
    return formatFullDate(stats.prochaineDate)
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
    icon: CloudArrowUpIcon,
    title: 'Camp de base',
    description: locationLabel.value,
  },
  {
    icon: LockClosedIcon,
    title: 'Prochaine disponibilité',
    description: nextSessionLabel.value,
  },
  {
    icon: ServerIcon,
    title: 'Stages proposés',
    description: aventuresCountLabel.value,
  },
])

const moniteurClosing = computed(() => {
  const name = moniteurName.value || 'Ce moniteur'
  const location = locationLabel.value
  return `${name} accueille les grimpeurs à ${location} et adapte chaque aventure selon le niveau et les envies du groupe.`
})

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
