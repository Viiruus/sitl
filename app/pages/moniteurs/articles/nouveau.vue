<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
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
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <MoniteursArticleEditor mode="create" :guide="guide" @created="handleCreated" />
  </GuideShell>
</template>
