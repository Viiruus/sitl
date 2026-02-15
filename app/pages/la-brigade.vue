<template>
  <div class="bg-brand-950">
    <!-- Hero with background -->
    <div class="relative overflow-hidden pb-16">
      <div class="absolute inset-0">
        <picture class="block h-full w-full">
          <source
            type="image/webp"
            srcset="/images/optimized/emulation2-480.webp 480w, /images/optimized/emulation2-768.webp 768w, /images/optimized/emulation2-1024.webp 1024w, /images/optimized/emulation2-1440.webp 1440w, /images/optimized/emulation2-1920.webp 1920w"
            sizes="100vw"
          />
          <img
            src="/images/emulation2.jpeg"
            alt="Les moniteurs de la Brigade du kiff"
            class="h-full w-full object-cover opacity-40"
            width="3824"
            height="2602"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
        </picture>
        <div class="absolute inset-0 bg-brand-950/70" />
        <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-brand-950" />
      </div>
      <div class="relative">
        <!-- Header réutilisable -->
        <AppHeader />

        <!-- Hero Section -->
        <div class="mx-auto max-w-7xl px-6 pt-16 lg:px-8">
          <div class="max-w-4xl py-16 sm:py-24">
            <h2 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">Rencontre la Brigade du kiff</h2>
            <p class="mt-6 text-base text-brand-100/80">La Brigade du kiff est née pour te faire profiter au maximum de l’escalade en milieux naturels. Nos moniteurs connaissent leurs territoires et sauront te faire découvrir les meilleurs spots près ou loin de chez toi. Que ce soit pour t’initier, pour progresser ou pour te perfectionner, nos moniteurs diplômés d’État seront là pour toi.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Listing Section -->
    <div class="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-8">
      <div class="mx-auto max-w-2xl lg:max-w-4xl xl:max-w-none">
        <div v-if="pending" class="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div v-for="n in 4" :key="n" class="h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
        <div v-else-if="moniteurs.length === 0" class="rounded-2xl border border-dashed border-white/20 p-10 text-center text-gray-400">
          Aucun moniteur n’est disponible pour le moment.
        </div>
        <div v-else>
          <ul
            role="list"
            class="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4"
          >
            <li v-for="moniteur in randomizedMoniteurs" :key="moniteur.id">
              <NuxtLink
                :to="`/moniteurs/${moniteur.slug}`"
                class="group flex h-full flex-col gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div class="relative aspect-[7/8] overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-white/10">
                  <img
                    class="absolute inset-0 h-full w-full object-cover"
                    :src="profileImageFor(moniteur)"
                    :srcset="profileImageSrcset(moniteur)"
                    :alt="moniteur.fullName"
                    decoding="async"
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                    loading="lazy"
                  />
                </div>
                <div class="flex flex-col gap-3">
                  <div>
                    <h3 class="text-lg/8 font-semibold tracking-tight text-white group-hover:text-secondaryBrand-200">
                      {{ moniteur.fullName }}
                    </h3>
                    <p class="text-sm font-medium uppercase tracking-[0.3em] text-secondaryBrand-200/80">
                      {{ locationLabelFor(moniteur) }}
                    </p>
                  </div>
                  <p class="text-base/7 text-gray-300">
                    {{ bioSnippet(moniteur.bio) }}
                  </p>
                </div>
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-16 flex justify-center">
            <NuxtLink
              to="/stages-escalade"
              class="inline-flex items-center gap-3 rounded-full bg-secondaryBrand-500/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400"
            >
              Voir les aventures de la brigade
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer réutilisable -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'

useHead({
  titleTemplate: '%s',
})

useSeoMeta({
  title: 'Brigade du kiff | Collectif de moniteurs diplômés',
  description:
    'Un collectif de moniteurs d’escalade passionnés qui propose des stages et aventures outdoor partout en France.',
  robots: 'index, follow, max-image-preview:large',
})

const { data, pending } = await useFetch('/api/moniteurs')
const randomWeights = useState<Record<number, number>>('la-brigade-moniteurs-order', () => ({}))

const moniteurs = computed(() => data.value?.moniteurs ?? [])

watch(
  () => moniteurs.value,
  (list) => {
    if (!list.length) {
      randomWeights.value = {}
      return
    }
    list.forEach((moniteur: any) => {
      const key = moniteur.id
      if (key == null) return
      if (randomWeights.value[key] === undefined) {
        randomWeights.value[key] = Math.random()
      }
    })
  },
  { immediate: true, deep: true },
)

const randomizedMoniteurs = computed(() => {
  const weights = randomWeights.value
  return moniteurs.value
    .slice()
    .sort((a: any, b: any) => {
      const wA = weights[a?.id] ?? 0
      const wB = weights[b?.id] ?? 0
      return wA - wB
    })
})

const fallbackImage = '/images/escalade-grande-voie-calanques.jpg'

const profileImageFor = (moniteur: any) => {
  return resolveStoredImageSrc(moniteur?.profileImageUrl, moniteur?.profileImageVariants) || fallbackImage
}

const profileImageSrcset = (moniteur: any) => {
  return buildStoredSrcset(moniteur?.profileImageVariants)
}

const locationLabelFor = (moniteur: any) => {
  return moniteur?.baseLocation || 'Localisation à venir'
}

const bioSnippet = (bio?: string | null) => {
  if (!bio) return 'Bio à venir.'
  return bio.length > 220 ? `${bio.slice(0, 220).trimEnd()}…` : bio
}
</script>
