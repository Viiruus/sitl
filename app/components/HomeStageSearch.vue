<script setup lang="ts">
import { STAGE_REGION_BOUNDS } from '~~/shared/utils/stage-region'

const router = useRouter()

const selectedDiscipline = ref('')
const selectedRegion = ref('')
const dateStart = ref('')
const dateEnd = ref('')

const disciplineOptions = [
  { value: 'FALAISE', label: 'Falaise' },
  { value: 'GRANDE_VOIE', label: 'Grande voie' },
  { value: 'BLOC', label: 'Bloc' },
  { value: 'TRAD', label: 'Terrain d’aventure' },
  { value: 'VIA_FERRATA', label: 'Via ferrata' },
]

const regionOptions = [...STAGE_REGION_BOUNDS].sort((a, b) => a.label.localeCompare(b.label, 'fr'))

const submitSearch = async () => {
  if (dateStart.value && dateEnd.value && dateEnd.value < dateStart.value) {
    dateEnd.value = dateStart.value
  }

  const query: Record<string, string> = {}
  if (selectedDiscipline.value) query.discipline = selectedDiscipline.value
  if (selectedRegion.value) query.region = selectedRegion.value
  if (dateStart.value) query.dateStart = dateStart.value
  if (dateEnd.value) query.dateEnd = dateEnd.value

  await router.push({ path: '/stages-escalade', query })
}
</script>

<template>
  <form
    class="grid overflow-hidden rounded-2xl bg-white/95 p-2 text-left shadow-2xl shadow-black/30 backdrop-blur sm:p-3 lg:grid-cols-[1fr_1.15fr_1.45fr_auto] lg:items-stretch"
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

    <div class="flex min-w-0 items-center gap-3 border-b border-gray-200 px-3 py-4 lg:border-r lg:border-b-0 lg:px-5">
      <svg class="size-6 shrink-0 text-secondaryBrand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path stroke-linecap="round" d="M8 3v4M16 3v4M3 10h18" />
      </svg>
      <fieldset class="min-w-0 flex-1">
        <legend class="text-xs font-semibold text-brand-950">Dates</legend>
        <div class="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <label class="min-w-0">
            <span class="sr-only">Date de début</span>
            <input
              v-model="dateStart"
              type="date"
              class="home-search-date w-full min-w-0 bg-transparent text-sm text-gray-600 outline-none"
            />
          </label>
          <span class="text-xs text-gray-400" aria-hidden="true">—</span>
          <label class="min-w-0">
            <span class="sr-only">Date de fin</span>
            <input
              v-model="dateEnd"
              type="date"
              :min="dateStart || undefined"
              class="home-search-date w-full min-w-0 bg-transparent text-sm text-gray-600 outline-none"
            />
          </label>
        </div>
      </fieldset>
    </div>

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

<style scoped>
.home-search-date::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
