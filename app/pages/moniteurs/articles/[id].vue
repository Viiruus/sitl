<script setup lang="ts">
definePageMeta({ middleware: 'guide-auth' })

useSeoMeta({
  title: 'Modifier un article',
  description: 'Modifie ton article.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()
const id = computed(() => String(route.params.id))

const [{ data: guideData }, { data: articleData, error, refresh }] = await Promise.all([
  useFetch('/api/guides/me'),
  useFetch(() => `/api/guides/articles/${id.value}`),
])

if (error.value) {
  throw createError({ statusCode: error.value.statusCode || 404, statusMessage: 'Article introuvable' })
}

const guide = computed(() => guideData.value?.guide ?? null)
const article = computed(() => articleData.value?.article ?? null)

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-10">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />
      <main class="min-w-0 flex-1">
        <MoniteursArticleEditor v-if="article" mode="edit" :article="article" :guide="guide" @updated="refresh" />
      </main>
    </div>
  </div>
</template>
