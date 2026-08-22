<script setup lang="ts">const route = useRoute(); const id = Number(route.params.id)</script>
<template><AdminAdminShell title="Modifier le stage" eyebrow="Stages & sessions"><AdminStageEditor mode="edit" :stage-id="id" /></AdminAdminShell></template>

