<template>

  <div class="bg-brand-950 py-24 sm:py-32">
    <!-- Header réutilisable -->
    <AppHeader />

    <!-- Hero Section -->
    <div class="mx-auto max-w-7xl px-6 pt-16 lg:px-8">
      <div class="mx-auto max-w-2xl sm:text-center">
        <h2 class="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">Voici la brigade du kif</h2>
        <p class="mt-6 text-lg/8 text-gray-400">We’re a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients.</p>
      </div>
      <div class="mx-auto mt-20 max-w-2xl lg:max-w-4xl xl:max-w-none">
        <div v-if="pending" class="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div v-for="n in 4" :key="n" class="h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
        <div v-else-if="moniteurs.length === 0" class="rounded-2xl border border-dashed border-white/20 p-10 text-center text-gray-400">
          Aucun moniteur n’est disponible pour le moment.
        </div>
        <ul
          v-else
          role="list"
          class="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:gap-x-8 xl:grid-cols-3"
        >
          <li v-for="moniteur in moniteurs" :key="moniteur.id">
            <NuxtLink
              :to="`/moniteurs/${moniteur.slug}`"
              class="group flex h-full flex-col gap-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div class="relative aspect-[3/4] overflow-hidden rounded-2xl outline-1 -outline-offset-1 outline-white/10">
                <img
                  class="absolute inset-0 h-full w-full object-cover"
                  :src="profileImageFor(moniteur)"
                  :alt="moniteur.fullName"
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
      </div>
    </div>
  </div>
  
  <!-- Footer réutilisable -->
  <AppFooter />
  
</template>

<script setup lang="ts">
const { data, pending } = await useFetch('/api/moniteurs')
const shuffledMoniteurs = useState<any[]>('la-brigade-moniteurs', () => [])

const moniteurs = computed(() => shuffledMoniteurs.value)

const shuffleMoniteurs = (list: any[]) => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

watch(
  () => data.value?.moniteurs,
  (newList) => {
    if (Array.isArray(newList)) {
      shuffledMoniteurs.value = shuffleMoniteurs(newList)
    } else {
      shuffledMoniteurs.value = []
    }
  },
  { immediate: true },
)

const fallbackImage = '/images/escalade-grande-voie-calanques.jpg'

const profileImageFor = (moniteur: any) => {
  if (moniteur?.profileImageUrl) return moniteur.profileImageUrl
  return fallbackImage
}

const locationLabelFor = (moniteur: any) => {
  return moniteur?.baseLocation || 'Localisation à venir'
}

const bioSnippet = (bio?: string | null) => {
  if (!bio) return 'Bio à venir.'
  return bio.length > 220 ? `${bio.slice(0, 220).trimEnd()}…` : bio
}
</script>
