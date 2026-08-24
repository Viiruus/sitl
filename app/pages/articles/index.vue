<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const { data, pending, error } = await useFetch('/api/articles', {
  default: () => ({ articles: [] }),
})
const articles = computed<any[]>(() => data.value?.articles ?? [])
const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => {
  try {
    return new URL('/articles', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/articles'
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  title: 'Carnet vertical | Les récits des moniteurs de la Brigade du kiff',
  description: 'Découvre les récits, conseils et aventures verticales des moniteurs de la Brigade du kiff.',
  robots: 'index, follow, max-image-preview:large',
})
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f5] text-[#242424]">
    <div class="bg-brand-950 text-white">
      <AppHeader compact />
      <div class="w-full px-4 pb-20 pt-40 sm:px-6 lg:px-8 lg:pb-24">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-200">
          Les récits de la Brigade
        </p>
        <h1 class="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-pretty sm:text-7xl">
          Carnet vertical
        </h1>
        <p class="mt-6 max-w-2xl text-lg/8 text-brand-100/80">
          Histoires de cordées, conseils de terrain et aventures racontées par les moniteurs de la Brigade.
        </p>
      </div>
    </div>

    <main class="w-full px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
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
          />
        </li>
      </ul>
    </main>

    <AppFooter />
  </div>
</template>
