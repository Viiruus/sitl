<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { openModal } = useAuthModal()
const { loggedIn, user, fetch } = useUserSession()

useSeoMeta({
  title: 'Connexion grimpeur',
  description: 'Connexion ou inscription grimpeur via WhatsApp.',
  robots: 'noindex, nofollow',
})

onMounted(async () => {
  await fetch()
  if (loggedIn.value && user.value?.role === 'GUIDE') {
    await router.replace('/moniteurs')
    return
  }
  openModal()
  // Rester sur la page précédente si possible, sinon revenir à l'accueil
  const previous = route.redirectedFrom?.fullPath
  if (previous) {
    await router.replace(previous)
  } else {
    await router.replace('/')
  }
})
</script>

<template>
  <div />
</template>
