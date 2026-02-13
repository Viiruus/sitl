<script setup lang="ts">
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
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1">
        <div class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <div class="flex justify-end">
            <NuxtLink
              to="/moniteurs/aventures"
              class="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-brand-100/80 transition hover:border-secondaryBrand-400 hover:text-white"
            >
              ← Retour aux aventures
            </NuxtLink>
          </div>

          <div v-if="pending" class="mt-6 space-y-4">
            <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-2xl bg-white/10" />
          </div>

          <div
            v-else-if="fetchError"
            class="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100"
          >
            Impossible de charger l’aventure. {{ fetchError?.data?.message || fetchError?.statusMessage || '' }}
          </div>

          <div v-else class="mt-6">
            <MoniteursAventureEditor mode="edit" :initial-data="aventure" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
