<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/articles', {
  query: { limit: 3 },
  default: () => ({ articles: [] }),
})

const articles = computed<any[]>(() => data.value?.articles ?? [])

</script>

<template>
  <section class="bg-[#f7f7f5] py-20 text-[#242424] sm:py-28">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-600">
            Carnet vertical
          </p>
          <h2 class="mt-3 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
            Les récits des moniteurs
          </h2>
        </div>
        <NuxtLink
          to="/articles"
          class="hidden w-fit items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-500 sm:inline-flex"
        >
          Tous les récits
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-12 grid gap-6 md:grid-cols-3">
        <div v-for="index in 3" :key="index" class="h-[28rem] animate-pulse rounded-3xl bg-black/5" />
      </div>
      <p v-else-if="error" class="mt-12 text-sm text-red-700">
        Impossible de charger les récits pour le moment.
      </p>
      <p v-else-if="!articles.length" class="mt-12 rounded-3xl border border-black/10 bg-white p-8 text-[#6b6b6b]">
        Les premiers récits de la Brigade arrivent bientôt.
      </p>
      <ul v-else role="list" class="mt-12 grid gap-6 md:grid-cols-3">
        <li v-for="article in articles" :key="article.id">
          <ArticleCard :article="article" />
        </li>
      </ul>

      <div v-if="articles.length" class="mt-8 flex justify-center sm:hidden">
        <NuxtLink
          to="/articles"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400"
        >
          Tous les récits
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
