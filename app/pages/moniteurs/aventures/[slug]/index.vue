<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { clear, fetch } = useUserSession()
const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const { data: aventureData, pending, error: fetchError } = await useFetch(
  () => (slug.value ? `/api/guides/aventures/${slug.value}` : null),
  {
    watch: [slug],
  },
)

const aventure = computed(() => aventureData.value?.aventure ?? null)

useSeoMeta(() => ({
  title: aventure.value?.titre ? `Éditer : ${aventure.value.titre}` : 'Éditer une aventure',
  description: 'Mets à jour le contenu et les détails de ton aventure.',
  robots: 'noindex, nofollow',
}))

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}
</script>

<template>
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <div class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <div class="flex justify-end">
        <NuxtLink
          to="/moniteurs/aventures"
          class="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-slate-900"
        >
          ← Retour aux aventures
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-6 space-y-4">
        <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div
        v-else-if="fetchError"
        class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        Impossible de charger l’aventure. {{ fetchError?.data?.message || fetchError?.statusMessage || '' }}
      </div>

      <div v-else class="mt-6">
        <MoniteursAventureEditor mode="edit" :initial-data="aventure" />
      </div>
    </div>
  </GuideShell>
</template>
