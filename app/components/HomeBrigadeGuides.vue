<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/moniteurs', {
  default: () => ({ moniteurs: [] }),
})

const moniteurs = computed<any[]>(() => data.value?.moniteurs ?? [])

const randomizedMoniteurIds = useState<Array<number | string>>('home-brigade-random-moniteur-ids', () => {
  const ids = moniteurs.value.map(moniteur => moniteur.id)

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]]
  }

  return ids.slice(0, 4)
})

const featuredMoniteurs = computed(() => {
  const moniteursById = new Map(moniteurs.value.map(moniteur => [moniteur.id, moniteur]))
  const selected = randomizedMoniteurIds.value
    .map(id => moniteursById.get(id))
    .filter(Boolean)
  const selectedIds = new Set(selected.map(moniteur => moniteur.id))
  const replacements = moniteurs.value.filter(moniteur => !selectedIds.has(moniteur.id))

  return [...selected, ...replacements].slice(0, 4)
})
</script>

<template>
  <section class="bg-brand-950 py-20 text-white sm:py-28">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-200">
            Le collectif
          </p>
          <h2 class="mt-3 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
            Les moniteurs de la Brigade
          </h2>
        </div>
        <NuxtLink
          to="/la-brigade"
          class="hidden w-fit items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-400 sm:inline-flex"
        >
          Toute la Brigade
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-12 text-sm text-brand-100/70">
        Chargement des moniteurs…
      </div>
      <div v-else-if="error" class="mt-12 text-sm text-red-300">
        Impossible de charger les moniteurs pour le moment.
      </div>
      <div v-else-if="!featuredMoniteurs.length" class="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 text-brand-100/80">
        Les profils de la Brigade seront bientôt disponibles.
      </div>
      <ul
        v-else
        role="list"
        class="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
      >
        <li
          v-for="moniteur in featuredMoniteurs"
          :key="moniteur.id"
          class="w-[82vw] max-w-sm shrink-0 snap-start sm:w-80 lg:w-[calc((100%-4.5rem)/4)] lg:max-w-none"
        >
          <GuideCard
            :moniteur="moniteur"
            image-sizes="(min-width: 1024px) 25vw, (min-width: 640px) 320px, 82vw"
          />
        </li>
      </ul>

      <div v-if="featuredMoniteurs.length" class="mt-8 flex justify-center sm:hidden">
        <NuxtLink
          to="/la-brigade"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
        >
          Toute la Brigade
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
