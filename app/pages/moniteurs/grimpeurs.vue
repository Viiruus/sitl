<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Grimpeur·euse·s inscrit·e·s',
  description: 'Liste des grimpeur·euse·s inscrit·e·s sur la plateforme.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()

const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const { data, pending } = await useFetch('/api/guides/climbers')
const climbers = computed(() => data.value?.climbers ?? [])

const formatRegistrationDate = (value?: string | Date | null) => {
  if (!value) return 'Date inconnue'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

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
        Communauté
      </p>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-semibold">
            Grimpeur·euse·s inscrit·e·s
          </h1>
          <p class="mt-2 text-slate-600">
            Liste des grimpeur·euse·s de la plateforme, du plus récent au plus ancien.
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 px-5 py-4 text-right ring-1 ring-slate-200">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
            Total
          </p>
          <p class="mt-2 text-3xl font-semibold">
            {{ climbers.length }}
          </p>
        </div>
      </div>
    </section>

    <section class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <div v-if="pending" class="text-slate-600">
        Chargement des grimpeur·euse·s…
      </div>

      <div v-else-if="!climbers.length" class="text-slate-600">
        Aucun·e grimpeur·euse inscrit·e pour le moment.
      </div>

      <div v-else class="overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Grimpeur·euse
                </th>
                <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Date d'inscription
                </th>
                <th scope="col" class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Stages inscrits
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-slate-50">
              <tr
                v-for="climber in climbers"
                :key="climber.id"
                class="transition hover:bg-white"
              >
                <td class="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                  {{ climber.fullName }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {{ formatRegistrationDate(climber.registeredAt) }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-amber-700">
                  {{ climber.stageBookingsCount }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </GuideShell>
</template>
