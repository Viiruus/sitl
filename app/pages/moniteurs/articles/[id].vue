<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
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
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <MoniteursArticleEditor v-if="article" mode="edit" :article="article" :guide="guide" @updated="refresh" />
  </GuideShell>
</template>
