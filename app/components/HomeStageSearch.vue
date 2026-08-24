<script setup lang="ts">
import { getStageRegionForCoordinates, STAGE_REGION_BOUNDS } from '~~/shared/utils/stage-region'

const router = useRouter()

const selectedDiscipline = ref('')
const selectedRegion = ref('')

const { data: availabilityData } = await useFetch('/api/aventures', {
  key: 'home-stage-search-availability',
  default: () => ({ aventures: [] }),
})

const availableStages = computed<any[]>(() => availabilityData.value?.aventures ?? [])

const allDisciplineOptions = [
  { value: 'FALAISE', label: 'Falaise' },
  { value: 'GRANDE_VOIE', label: 'Grande voie' },
  { value: 'BLOC', label: 'Bloc' },
  { value: 'TRAD', label: 'Terrain d’aventure' },
  { value: 'VIA_FERRATA', label: 'Via ferrata' },
]

const disciplineOptions = computed(() => {
  const availableValues = new Set(
    availableStages.value.map(stage => stage.discipline).filter(Boolean),
  )
  return allDisciplineOptions.filter(option => availableValues.has(option.value))
})

const regionOptions = computed(() => {
  const availableValues = new Set(
    availableStages.value
      .map(stage => getStageRegionForCoordinates(stage.latitude, stage.longitude)?.value)
      .filter(Boolean),
  )

  return [...STAGE_REGION_BOUNDS]
    .filter(region => availableValues.has(region.value))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
})

const submitSearch = async () => {
  const query: Record<string, string> = {}
  if (selectedDiscipline.value) query.discipline = selectedDiscipline.value
  if (selectedRegion.value) query.region = selectedRegion.value

  await router.push({ path: '/stages-escalade', query })
}
</script>

<template>
  <form
    class="grid overflow-hidden rounded-2xl bg-white/95 p-2 text-left shadow-2xl shadow-black/30 backdrop-blur sm:p-3 lg:grid-cols-[1fr_1fr_auto] lg:items-stretch"
    aria-label="Rechercher un stage d’escalade"
    @submit.prevent="submitSearch"
  >
    <label class="flex min-w-0 items-center gap-3 border-b border-gray-200 px-3 py-4 lg:border-r lg:border-b-0 lg:px-5">
      <svg class="size-6 shrink-0 text-secondaryBrand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m3 19 6.5-10 3.5 5 2.5-4L21 19H3Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 19h14" />
      </svg>
      <span class="min-w-0 flex-1">
        <span class="block text-xs font-semibold text-brand-950">Activité</span>
        <select
          v-model="selectedDiscipline"
          class="mt-1 w-full cursor-pointer appearance-none bg-transparent pr-4 text-sm text-gray-600 outline-none"
        >
          <option value="">Toutes les pratiques</option>
          <option v-for="option in disciplineOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </span>
    </label>

    <label class="flex min-w-0 items-center gap-3 border-b border-gray-200 px-3 py-4 lg:border-r lg:border-b-0 lg:px-5">
      <svg class="size-6 shrink-0 text-secondaryBrand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
        <circle cx="12" cy="11" r="2.3" />
      </svg>
      <span class="min-w-0 flex-1">
        <span class="block text-xs font-semibold text-brand-950">Région</span>
        <select
          v-model="selectedRegion"
          class="mt-1 w-full cursor-pointer appearance-none bg-transparent pr-4 text-sm text-gray-600 outline-none"
        >
          <option value="">Toutes les régions</option>
          <option v-for="option in regionOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </span>
    </label>

    <button
      type="submit"
      class="mx-4 my-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondaryBrand-500 px-7 py-2 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-500"
    >
      <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path stroke-linecap="round" d="m16 16 4 4" />
      </svg>
      Rechercher
    </button>
  </form>
</template>
