<script setup lang="ts">
definePageMeta({ middleware: 'guide-auth' })

useSeoMeta({
  title: 'Écrire un article',
  description: 'Rédige un nouvel article.',
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

const handleCreated = (id: number) => {
  router.replace(`/moniteurs/articles/${id}`)
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-10">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />
      <main class="min-w-0 flex-1">
        <MoniteursArticleEditor mode="create" :guide="guide" @created="handleCreated" />
      </main>
    </div>
  </div>
</template>
