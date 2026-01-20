<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { openModal } = useAuthModal()

onMounted(async () => {
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
