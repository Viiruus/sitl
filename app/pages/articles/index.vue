<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const { data, pending, error } = await useFetch('/api/articles', {
  default: () => ({ articles: [] }),
})
const articles = computed<any[]>(() => data.value?.articles ?? [])
const runtimeConfig = useRuntimeConfig()
const seoTitle = 'Carnet vertical : récits et conseils d’escalade'
const seoDescription = 'Explore les récits de cordée, conseils de terrain et aventures en falaise, grande voie ou montagne racontés par les moniteurs de la Brigade du Kiff.'
const canonicalUrl = computed(() => {
  try {
    return new URL('/articles', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/articles'
  }
})
const socialImageUrl = computed(() => {
  try {
    return new URL('/images/brigade-du-kiff-falaise-escalade-hd.jpg', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/images/brigade-du-kiff-falaise-escalade-hd.jpg'
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: () => socialImageUrl.value,
  ogImageAlt: 'Escalade en falaise avec la Brigade du Kiff',
  ogSiteName: 'Brigade du Kiff',
  ogType: 'website',
  ogUrl: () => canonicalUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: () => socialImageUrl.value,
  twitterImageAlt: 'Escalade en falaise avec la Brigade du Kiff',
  robots: 'index, follow, max-image-preview:large',
})
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f5] text-[#242424]">
    <div class="bg-brand-950 text-white">
      <AppHeader compact />
      <div class="mx-auto w-full max-w-[90rem] px-4 pb-20 pt-40 sm:px-6 lg:px-8 lg:pb-24">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-200">
          Récits de nos aventures
        </p>
        <h1 class="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-pretty sm:text-7xl">
          Carnet vertical
        </h1>
        <p class="mt-6 max-w-2xl text-lg/8 text-brand-100/80">
          Histoires de cordées, conseils de terrain, réflexions philosophiques… racontés par les moniteur•ices du collectif.
        </p>
      </div>
    </div>

    <main class="mx-auto w-full max-w-[90rem] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div v-if="pending" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="index in 6" :key="index" class="h-[30rem] animate-pulse rounded-3xl bg-black/5" />
      </div>
      <p v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
        Impossible de charger les récits pour le moment.
      </p>
      <p v-else-if="!articles.length" class="rounded-3xl border border-black/10 bg-white p-10 text-center text-[#6b6b6b]">
        Les premiers récits de la Brigade arrivent bientôt.
      </p>
      <ul v-else role="list" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <li v-for="article in articles" :key="article.id">
          <ArticleCard
            :article="article"
            image-sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            heading-level="h2"
            flush-author
          />
        </li>
      </ul>
    </main>

    <AppFooter />
  </div>
</template>
