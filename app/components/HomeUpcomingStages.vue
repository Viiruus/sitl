<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/aventures', {
  query: {
    mode: 'home',
    limit: 6,
  },
  default: () => ({ aventures: [] }),
})

const upcomingStages = computed(() => data.value?.aventures ?? [])
</script>

<template>
  <section id="stages" class="bg-white py-20 text-[#242424] sm:py-28">
    <div class="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-600">
            Prochains départs
          </p>
          <h2 class="mt-3 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
            Les prochains stages
          </h2>
        </div>
        <NuxtLink
          to="/stages-escalade"
          class="hidden w-fit items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-400 sm:inline-flex"
        >
          Tous les stages
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-12 text-sm text-[#6b6b6b]">
        Chargement des stages…
      </div>
      <div v-else-if="error" class="mt-12 text-sm text-red-700">
        Impossible de charger les prochains stages.
      </div>
      <div v-else-if="!upcomingStages.length" class="mt-12 rounded-3xl border border-black/10 bg-white p-8 text-[#6b6b6b]">
        Encore aucune date publiée. Reviens très vite !
      </div>
      <div v-else class="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <StageCard
          v-for="stage in upcomingStages"
          :key="stage.id"
          :stage="stage"
          :session="stage.nextSession"
          heading-level="h3"
          :with-border="false"
          image-sizes="(min-width: 1536px) 680px, (min-width: 1024px) calc(50vw - 3rem), 100vw"
        />
      </div>

      <div v-if="upcomingStages.length" class="mt-10 flex justify-center sm:hidden">
        <NuxtLink
          to="/stages-escalade"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400"
        >
          Tous les stages
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
