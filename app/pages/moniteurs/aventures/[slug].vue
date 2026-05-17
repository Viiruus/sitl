<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Aventure moniteur·ice',
  description: 'Gestion d’une aventure moniteur·ice.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <NuxtPage />
</template>
