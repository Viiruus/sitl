<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Aventure moniteur',
  description: 'Gestion d’une aventure moniteur.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <NuxtPage />
</template>
