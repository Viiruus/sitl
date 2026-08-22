<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)
</script>
<template><AdminAdminShell title="Modifier le compte" eyebrow="Utilisateurs"><AdminUserEditor mode="edit" :user-id="id" /></AdminAdminShell></template>

