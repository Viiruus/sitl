<template>
  <div class="bg-brand-950">
    <AppHeader />

    <main>
      <section class="relative isolate flex min-h-[46rem] items-center overflow-hidden lg:min-h-screen">
        <picture class="absolute inset-0 -z-20 block size-full">
          <source
            type="image/webp"
            srcset="/images/optimized/brigade-du-kiff-falaise-escalade-480.webp 480w, /images/optimized/brigade-du-kiff-falaise-escalade-768.webp 768w, /images/optimized/brigade-du-kiff-falaise-escalade-1024.webp 1024w, /images/optimized/brigade-du-kiff-falaise-escalade-1440.webp 1440w, /images/optimized/brigade-du-kiff-falaise-escalade-1600.webp 1600w"
            sizes="100vw"
          />
          <img
            src="/images/brigade-du-kiff_falaise_escalade.jpeg"
            alt=""
            class="size-full object-cover"
            width="1600"
            height="900"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
        </picture>
        <div class="absolute inset-0 -z-10 bg-brand-950/45" />
        <div class="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/65 via-brand-950/25 to-brand-950/90" />

        <div class="mx-auto w-full max-w-7xl px-6 pt-36 pb-20 sm:pt-44 sm:pb-28 lg:px-8">
          <div class="mx-auto max-w-4xl text-center">
            <h1 class="text-5xl font-semibold tracking-tight text-pretty text-white drop-shadow-lg sm:text-7xl">
              Grimpez dehors !
            </h1>
            <p class="mx-auto mt-6 max-w-2xl text-lg font-medium text-pretty text-white/85 drop-shadow sm:text-xl/8">
              Vos aventures verticales commencent ici, avec notre collectif de moniteur·ices d'escalade.
            </p>
          </div>

          <div class="mx-auto mt-12 max-w-3xl sm:mt-16">
            <HomeStageSearch />
          </div>
        </div>
      </section>

      <HomeUpcomingStages />
      <HomeBrigadeGuides />
      <HomeLatestArticles />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => {
  try {
    return new URL('/', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/'
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
  title: 'Aventures d’escalade encadrées | Falaise, grande voie, bloc, terrain d\'aventure, via ferrata',
  description:
    'Des stages d’escalade outdoor pour progresser avec des moniteurs locaux. Choisis ton terrain de jeu et pars à l’aventure.',
  robots: 'index, follow, max-image-preview:large',
})

</script>

<style>
  html {
    scroll-behavior: smooth;
  }
</style>
