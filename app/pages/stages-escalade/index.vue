<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
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
</script>

<template>
  <div class="bg-brand-950">
    <AppHeader />

    <div class="relative isolate overflow-hidden bg-brand-950 pt-32">
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

    <StageExplorer />
  </div>

  <AppFooter />
</template>
