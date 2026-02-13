<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Créer une aventure',
  description: 'Renseigne les détails pour publier une aventure d’escalade.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()

const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}

const handleCreated = (slug: string) => {
  router.replace(`/moniteurs/aventures/${slug}`)
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1">
        <div class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <MoniteursAventureEditor mode="create" @created="handleCreated" />
        </div>
      </main>
    </div>
  </div>
</template>
