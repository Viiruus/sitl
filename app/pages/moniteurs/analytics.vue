<script setup lang="ts">
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

const selectedDays = ref(30)

const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const {
  data,
  pending,
  error,
  refresh,
} = await useFetch('/api/guides/analytics/moniteurs', {
  query: {
    days: selectedDays,
  },
  watch: [selectedDays],
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
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1 space-y-8">
        <section class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.4em] text-secondaryBrand-300">
            Analytics
          </p>
          <div class="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 class="text-3xl font-semibold">
                Pages moniteurs les plus vues
              </h1>
              <p class="mt-2 max-w-2xl text-brand-100/80">
                Classement des fiches publiques <span class="font-medium text-secondaryBrand-200">/moniteurs/...</span> selon les données Vercel Web Analytics.
              </p>
              <p v-if="range" class="mt-2 text-sm text-brand-200/70">
                Période : {{ formatDate(range.since) }} → {{ formatDate(range.until) }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label class="text-sm text-brand-100/80">
                Période
                <select
                  v-model.number="selectedDays"
                  class="mt-1 block rounded-xl border border-white/10 bg-brand-900 px-4 py-2 text-sm text-white outline-none transition focus:border-secondaryBrand-300"
                >
                  <option :value="7">
                    7 jours
                  </option>
                  <option :value="30">
                    30 jours
                  </option>
                </select>
              </label>

              <button
                type="button"
                class="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 disabled:cursor-wait disabled:opacity-60"
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
          <div class="rounded-2xl bg-brand-900/60 p-5 ring-1 ring-white/10">
            <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
              Visiteurs
            </p>
            <p class="mt-2 text-3xl font-semibold">
              {{ formatNumber(totalVisitors) }}
            </p>
          </div>
          <div class="rounded-2xl bg-brand-900/60 p-5 ring-1 ring-white/10">
            <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
              Pages vues
            </p>
            <p class="mt-2 text-3xl font-semibold">
              {{ formatNumber(totalPageviews) }}
            </p>
          </div>
        </section>

        <section
          v-if="!isConfigured"
          class="rounded-3xl border border-amber-400/40 bg-amber-500/10 p-8 text-amber-100/90"
        >
          <p class="text-sm uppercase tracking-[0.3em] text-amber-200/80">
            Configuration requise
          </p>
          <h2 class="mt-3 text-2xl font-semibold">
            Vercel Analytics n’est pas encore connecté côté serveur.
          </h2>
          <p class="mt-3 text-sm text-amber-100/80">
            Ajoute ces variables d’environnement dans Vercel, puis redéploie :
          </p>
          <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-100/80">
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
          class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10"
        >
          <div v-if="pending" class="text-brand-100/70">
            Chargement des statistiques…
          </div>

          <div v-else-if="error" class="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">
            Impossible de récupérer les statistiques Vercel Analytics.
            <p class="mt-2 text-sm text-red-100/80">
              {{ error.statusMessage || error.message }}
            </p>
          </div>

          <div v-else-if="!rankings.length" class="text-brand-100/70">
            Aucune visite de fiche moniteur sur cette période.
          </div>

          <div v-else class="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-white/10">
                <thead class="bg-brand-900/80">
                  <tr>
                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-brand-200/80">
                      Rang
                    </th>
                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-brand-200/80">
                      Moniteur·ice
                    </th>
                    <th scope="col" class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.25em] text-brand-200/80">
                      Visiteurs
                    </th>
                    <th scope="col" class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.25em] text-brand-200/80">
                      Pages vues
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/10 bg-brand-900/45">
                  <tr
                    v-for="(item, index) in rankings"
                    :key="item.path"
                    class="transition hover:bg-white/5"
                  >
                    <td class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-brand-100/80">
                      #{{ index + 1 }}
                    </td>
                    <td class="px-5 py-4 text-sm">
                      <NuxtLink
                        :to="item.path"
                        class="font-medium text-white transition hover:text-secondaryBrand-200"
                      >
                        {{ item.fullName }}
                      </NuxtLink>
                      <p class="mt-1 text-xs text-brand-200/60">
                        {{ item.path }}
                        <span v-if="!item.knownGuide" class="ml-2 text-amber-200/80">
                          Ancien slug ou moniteur introuvable
                        </span>
                      </p>
                    </td>
                    <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-secondaryBrand-200">
                      {{ formatNumber(item.visitors) }}
                    </td>
                    <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-white">
                      {{ formatNumber(item.pageviews) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
