<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/admin/summary')
const cards = computed(() => [
  { label: 'Moniteurs', value: data.value?.counts.guides ?? 0, to: '/admin/utilisateurs?role=GUIDE' },
  { label: 'Grimpeurs', value: data.value?.counts.climbers ?? 0, to: '/admin/utilisateurs?role=CLIMBER' },
  { label: 'Stages', value: data.value?.counts.stages ?? 0, to: '/admin/stages' },
  { label: 'Sessions', value: data.value?.counts.sessions ?? 0, to: '/admin/stages' },
  { label: 'Réservations', value: data.value?.counts.bookings ?? 0, to: '/admin/reservations' },
])
</script>

<template>
  <AdminAdminShell title="Vue d’ensemble" eyebrow="Pilotage">
    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div v-for="n in 5" :key="n" class="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
    </div>
    <p v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-5 font-medium text-red-700">Impossible de charger les données.</p>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <NuxtLink v-for="card in cards" :key="card.label" :to="card.to" class="admin-panel group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-amber-300/40">
        <span class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 to-orange-500 opacity-70 transition group-hover:opacity-100" />
        <p class="text-sm font-medium text-slate-600">{{ card.label }}</p>
        <div class="mt-3 flex items-end justify-between gap-3">
          <p class="text-4xl font-bold tracking-tight text-slate-950">{{ card.value }}</p>
          <span class="text-lg text-amber-600 transition group-hover:translate-x-1">→</span>
        </div>
      </NuxtLink>
    </div>
    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <NuxtLink to="/admin/utilisateurs/nouveau" class="rounded-3xl bg-amber-400 p-7 font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition hover:bg-amber-300">Créer un compte →</NuxtLink>
      <NuxtLink to="/admin/stages/nouveau" class="admin-panel rounded-3xl p-7 font-bold text-slate-900 transition hover:border-sky-400/40">Créer un stage →</NuxtLink>
    </div>
  </AdminAdminShell>
</template>
