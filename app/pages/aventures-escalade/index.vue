<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/aventures')

const selectedDiscipline = ref<string | null>(null)

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grandes voies',
  FALAISE: 'Couenne',
  BLOC: 'Bloc',
  TRAD: 'Trad',
}

const formatDisciplineLabel = (value: string) => {
  return disciplineLabels[value] ?? value?.replace(/_/g, ' ') ?? 'Autre'
}

const disciplineOptions = computed(() => {
  const adventures = data.value?.aventures ?? []
  const seen = new Set<string>()
  return adventures.reduce<{ value: string; label: string }[]>((acc, aventure) => {
    if (aventure.discipline && !seen.has(aventure.discipline)) {
      seen.add(aventure.discipline)
      acc.push({
        value: aventure.discipline,
        label: formatDisciplineLabel(aventure.discipline),
      })
    }
    return acc
  }, [])
})

const iconForDiscipline = (value: string) => {
  const initial = (formatDisciplineLabel(value).charAt(0) || '?').toUpperCase()
  const palette: Record<string, string> = {
    GRANDE_VOIE: '#fbbf24',
    FALAISE: '#34d399',
    BLOC: '#60a5fa',
    TRAD: '#f472b6',
  }
  const color = palette[value] ?? '#f97316'
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
    <rect width='64' height='64' rx='18' fill='${color}'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' font-family='Inter, Arial' fill='#0f172a' font-weight='700'>${initial}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// ✅ Helper manquant pour la fallback image selon la discipline
const disciplineImageMap: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
}

const imageForDiscipline = (value?: string | null) => {
  if (!value) return '/images/escalade-grande-voie-calanques.jpg'
  return disciplineImageMap[value] ?? '/images/escalade-grande-voie-calanques.jpg'
}

const filteredAventures = computed(() => {
  let adventures = data.value?.aventures ?? []

  if (selectedDiscipline.value) {
    adventures = adventures.filter(
      (aventure) => aventure.discipline === selectedDiscipline.value
    )
  }

  return adventures
})

import IconBloc from '~/components/icons/IconBloc.vue'
import IconCouenne from '~/components/icons/IconCouenne.vue'
import IconGrandeVoie from '~/components/icons/IconGrandeVoie.vue'
import IconTrad from '~/components/icons/IconTrad.vue'

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
          <div class="max-w-3xl space-y-6">
            <h1 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
              Aventures d’escalade qui collent à ton style
            </h1>
            <p class="text-base text-brand-100/80">
              Séjours locaux imaginés par les moniteurs de la Brigade : grandes voies, couennes, bloc,
              grimpe pure ou immersion totale.
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
        <section class="space-y-4 rounded-3xl border border-brand-800 bg-brand-900/70 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Filtrer par discipline</p>
              <p class="text-sm text-brand-100/70">
                Choisis le type d’aventure qui t’intéresse.
              </p>
              <!--<IconBloc class="h-20 w-20 text-secondaryBrand-400" />
              <IconCouenne class="h-20 w-20 text-secondaryBrand-400" />
              <IconGrandeVoie class="h-20 w-20 text-secondaryBrand-400" />
              <IconTrad class="h-20 w-20 text-secondaryBrand-400" />
              <img src="/icons/brigade_icon_1.png" alt="Escalade en bloc" class="h-24 w-16" />
              <img src="/icons/brigade_icon_2.png" alt="Escalade en bloc" class="h-24 w-16" />
              <img src="/icons/brigade_icon_3.png" alt="Escalade en bloc" class="h-24 w-16" />
              <img src="/icons/brigade_icon_4.png" alt="Escalade en bloc" class="h-24 w-16" />
              -->
            </div>
            <button
              v-if="selectedDiscipline"
              type="button"
              class="text-xs font-semibold text-secondaryBrand-200 hover:text-secondaryBrand-100"
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
              class="flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition"
              :class="selectedDiscipline === option.value
                ? 'border-secondaryBrand-400 bg-secondaryBrand-500/20 text-white'
                : 'border-brand-800 bg-brand-900/80 text-brand-100'"
              @click="selectedDiscipline = option.value"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-950/60">
                <img
                  :src="iconForDiscipline(option.value)"
                  :alt="option.label"
                  class="h-8 w-8"
                  loading="lazy"
                />
              </span>
              <span class="font-medium">{{ option.label }}</span>
            </button>
            <p v-if="!disciplineOptions.length" class="text-xs text-brand-200/70">
              Les disciplines apparaîtront dès que des aventures seront publiées.
            </p>
          </div>

        </section>

        <div class="grid gap-6 md:grid-cols-2">
          <NuxtLink
            v-for="a in filteredAventures"
            :key="a.id"
            :to="`/aventures-escalade/${a.slug}`"
            class="block rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
          >
            <div class="relative h-64 w-full overflow-hidden">
              <img
                :src="a.coverImageUrl || imageForDiscipline(a.discipline)"
                :alt="a.titre"
                class="size-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent"></div>
              <div class="absolute inset-x-6 bottom-6 flex flex-col gap-3 text-white">
                <div class="flex flex-wrap items-center gap-3 text-xs text-brand-100/90">
                  <span class="inline-flex items-center rounded-full bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ring-1 ring-white/20">
                    {{ formatDisciplineLabel(a.discipline) }}
                  </span>
                  <span class="rounded-full border border-secondaryBrand-200/40 bg-secondaryBrand-500/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondaryBrand-100">
                    {{ a.jours }} {{ a.jours > 1 ? 'jours' : 'jour' }}
                  </span>
                </div>
                <h2 class="text-2xl font-semibold">{{ a.titre }}</h2>
                <p v-if="a.sousTitre" class="text-sm text-brand-100/80">{{ a.sousTitre }}</p>
                <p class="flex items-center gap-2 text-sm text-brand-100/80">
                  <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                  {{ a.lieuLabel }}
                </p>
              </div>
            </div>

            <div class="space-y-6 p-6">
              <dl class="grid grid-cols-1 gap-4 text-sm text-brand-100">
                <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <dt class="text-[10px] uppercase tracking-[0.3em] text-brand-200/80">Moniteur</dt>
                  <dd class="mt-2 flex items-center gap-3 font-semibold text-white">
                    <img
                      :src="a.guideImageUrl || iconForDiscipline(a.discipline)"
                      :alt="a.guideName || 'Moniteur'"
                      class="h-8 w-8 rounded-full border border-white/20 bg-brand-950/70 object-cover"
                    />
                    {{ a.guideName || 'Moniteur local' }}
                  </dd>
                </div>
              </dl>

              <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div class="text-brand-100">
                  À partir de
                  <span class="font-semibold">{{ a.prixParPersonne }} €</span>
                  <span class="text-brand-200/70 text-xs"> / personne</span>
                </div>
                <span
                  class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500/90 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-secondaryBrand-900/30 transition"
                >
                  Voir l’aventure
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
                  </svg>
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
