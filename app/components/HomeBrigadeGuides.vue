<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/moniteurs', {
  default: () => ({ moniteurs: [] }),
})

const moniteurs = computed<any[]>(() => data.value?.moniteurs ?? [])
const prioritizedMoniteurs = usePrioritizedRandomMoniteurs(
  moniteurs,
  'home-brigade-prioritized-moniteur-ids',
)
</script>

<template>
  <section id="moniteurs" aria-labelledby="home-guides-title" class="scroll-mt-24 bg-brand-950 py-20 text-white sm:py-28">
    <div class="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-200">
            Le collectif
          </p>
          <h2 id="home-guides-title" class="mt-3 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
            Les moniteur·ices
          </h2>
        </div>
        <NuxtLink
          to="/la-brigade"
          class="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-400"
        >
          Toute l'équipe
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-12 text-sm text-brand-100/70">
        Chargement des moniteurs…
      </div>
      <div v-else-if="error" class="mt-12 text-sm text-red-300">
        Impossible de charger les moniteurs pour le moment.
      </div>
      <div v-else-if="!prioritizedMoniteurs.length" class="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 text-brand-100/80">
        Les profils de la Brigade du kiff seront bientôt disponibles.
      </div>
      <BrigadeGuidesMap v-else :moniteurs="prioritizedMoniteurs" />
    </div>
  </section>
</template>
