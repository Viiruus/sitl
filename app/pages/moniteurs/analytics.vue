<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Pages moniteurs les plus vues',
  description: 'Classement des fiches moniteurs les plus consultées.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()

type AnalyticsRange = '7' | '30' | '365'

const selectedRange = ref<AnalyticsRange>('30')

const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch('/api/guides/analytics/moniteurs', {
  query: {
    range: selectedRange,
  },
  watch: [selectedRange],
})

const rankings = computed(() => data.value?.rankings ?? [])
const range = computed(() => data.value?.range ?? null)
const isConfigured = computed(() => data.value?.configured !== false)
const missingConfig = computed(() => data.value?.missing ?? null)

const totalPageviews = computed(() =>
  rankings.value.reduce((total, item) => total + Number(item.pageviews ?? 0), 0),
)

const totalVisitors = computed(() =>
  rankings.value.reduce((total, item) => total + Number(item.visitors ?? 0), 0),
)

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatNumber = (value?: number | null) =>
  new Intl.NumberFormat('fr-FR').format(Number(value ?? 0))

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}
</script>

<template>
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <section class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <p class="text-sm uppercase tracking-[0.4em] text-amber-700">
        Analytics
      </p>
      <div class="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-3xl font-semibold">
            Pages moniteurs les plus vues
          </h1>
          <p class="mt-2 max-w-2xl text-slate-600">
            Classement des fiches publiques <span class="font-medium text-amber-700">/moniteurs/...</span> selon les données Vercel Web Analytics.
          </p>
          <p v-if="range" class="mt-2 text-sm text-slate-500">
            Période : {{ formatDate(range.since) }} → {{ formatDate(range.until) }}
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label class="text-sm text-slate-600">
            Période
            <select
              v-model="selectedRange"
              class="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-200"
            >
              <option value="7">
                7 jours
              </option>
              <option value="30">
                30 jours
              </option>
              <option value="365">
                1 an
              </option>
            </select>
          </label>

          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
            :disabled="pending"
            @click="refresh"
          >
            Actualiser
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="isConfigured && !error"
      class="grid gap-4 sm:grid-cols-2"
    >
      <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
          Visiteurs
        </p>
        <p class="mt-2 text-3xl font-semibold">
          {{ formatNumber(totalVisitors) }}
        </p>
      </div>
      <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
          Pages vues
        </p>
        <p class="mt-2 text-3xl font-semibold">
          {{ formatNumber(totalPageviews) }}
        </p>
      </div>
    </section>

    <section
      v-if="!isConfigured"
      class="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-700"
    >
      <p class="text-sm uppercase tracking-[0.3em] text-amber-700">
        Configuration requise
      </p>
      <h2 class="mt-3 text-2xl font-semibold">
        Vercel Analytics n’est pas encore connecté côté serveur.
      </h2>
      <p class="mt-3 text-sm text-amber-700">
        Ajoute ces variables d’environnement dans Vercel, puis redéploie :
      </p>
      <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-700">
        <li v-if="missingConfig?.token">
          <code>VERCEL_TOKEN</code> ou <code>VERCEL_ANALYTICS_TOKEN</code>
        </li>
        <li v-if="missingConfig?.projectId">
          <code>VERCEL_ANALYTICS_PROJECT_ID</code> ou <code>VERCEL_PROJECT_ID</code>
        </li>
        <li>
          Optionnel si le projet est dans une team : <code>VERCEL_TEAM_ID</code> ou <code>VERCEL_TEAM_SLUG</code>
        </li>
      </ul>
    </section>

    <section
      v-else
      class="rounded-3xl bg-white p-8 ring-1 ring-slate-200"
    >
      <div v-if="pending" class="text-slate-600">
        Chargement des statistiques…
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        Impossible de récupérer les statistiques Vercel Analytics.
        <p class="mt-2 text-sm text-red-700">
          {{ error.statusMessage || error.message }}
        </p>
      </div>

      <div v-else-if="!rankings.length" class="text-slate-600">
        Aucune visite de fiche moniteur sur cette période.
      </div>

      <div v-else class="overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Rang
                </th>
                <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Moniteur·ice
                </th>
                <th scope="col" class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Visiteurs
                </th>
                <th scope="col" class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Pages vues
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-slate-50">
              <tr
                v-for="(item, index) in rankings"
                :key="item.path"
                class="transition hover:bg-white"
              >
                <td class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-600">
                  #{{ index + 1 }}
                </td>
                <td class="px-5 py-4 text-sm">
                  <NuxtLink
                    :to="item.path"
                    class="font-medium text-slate-900 transition hover:text-amber-700"
                  >
                    {{ item.fullName }}
                  </NuxtLink>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ item.path }}
                    <span v-if="!item.knownGuide" class="ml-2 text-amber-700">
                      Ancien slug ou moniteur introuvable
                    </span>
                  </p>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-amber-700">
                  {{ formatNumber(item.visitors) }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-900">
                  {{ formatNumber(item.pageviews) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </GuideShell>
</template>
