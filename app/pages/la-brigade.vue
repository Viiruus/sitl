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
            <p class="mt-6 text-base text-brand-100/80">La Brigade du kiff c’est avant tout la promo du DEJEPS Escalade Milieux Naturels 2025/2026. Fort.e.s d’une année riche en partages, en émotions et en apprentissages, nous avons décidé d’unir nos forces pour te faire profiter un maximum de l’escalade en milieux naturels.<br><br>Nos moniteur.ices connaissent leurs territoires et sauront te faire découvrir les meilleurs spots à coté ou loin de chez toi. Que ce soit pour t’initier, pour progresser ou pour te perfectionner, faire appel à la Brigade du kiff, c’est rejoindre une grande famille déjà bien soudée.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Listing Section -->
    <div class="w-full px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
      <div class="w-full">
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
              <GuideCard :moniteur="moniteur" />
            </li>
          </ul>
          <div class="mt-16 flex justify-center">
            <NuxtLink
              to="/stages-escalade"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-400"
            >
              Voir les aventures de la brigade
              <span aria-hidden="true">→</span>
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
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => {
  try {
    return new URL('/la-brigade', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/la-brigade'
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
}))

useSeoMeta({
  title: 'Brigade du kiff | Collectif de moniteurs diplômés',
  description:
    'Un collectif de moniteurs d’escalade passionnés qui propose des stages et aventures outdoor partout en France.',
  ogTitle: 'Brigade du kiff | Collectif de moniteurs diplômés',
  ogDescription:
    'Un collectif de moniteurs d’escalade passionnés qui propose des stages et aventures outdoor partout en France.',
  ogUrl: canonicalUrl.value,
  robots: 'index, follow, max-image-preview:large',
})

const { data, pending } = await useFetch('/api/moniteurs')

const moniteurs = computed(() => {
  const list = data.value?.moniteurs ?? []
  return list.filter((moniteur: any) => {
    const firstName = typeof moniteur?.firstName === 'string' ? moniteur.firstName.trim() : ''
    const lastName = typeof moniteur?.lastName === 'string' ? moniteur.lastName.trim() : ''
    return Boolean(firstName && lastName)
  })
})

const randomizedMoniteurs = computed(() => moniteurs.value)

const moniteursItemListStructuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Moniteurs de la Brigade du kiff',
  itemListElement: moniteurs.value.map((moniteur: any, index: number) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: new URL(`/moniteurs/${moniteur.slug}`, canonicalUrl.value).toString(),
    name: moniteur.fullName,
  })),
}))

useHead(() => ({
  script: moniteurs.value.length
    ? [
        {
          key: 'la-brigade-moniteurs-itemlist-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(moniteursItemListStructuredData.value),
        },
      ]
    : [],
}))

</script>
