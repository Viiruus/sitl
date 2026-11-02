<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
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
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <div class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <MoniteursAventureEditor mode="create" @created="handleCreated" />
    </div>
  </GuideShell>
</template>
