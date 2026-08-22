<script setup lang="ts">
const search = ref('')
const { data, pending, error, refresh } = await useFetch('/api/admin/stages', { query: computed(() => search.value ? { search: search.value } : {}) })
const deleting = ref<number | null>(null)
const guideName = (stage: any) => [stage.guide.firstName, stage.guide.lastName].filter(Boolean).join(' ') || stage.guide.email
const remove = async (stage: any) => {
  if (!window.confirm(`Supprimer définitivement « ${stage.titre} », ses sessions et ses réservations ?`)) return
  deleting.value = stage.id
  try { await $fetch(`/api/admin/stages/${stage.id}`, { method: 'DELETE' }); await refresh() }
  catch (e: any) { window.alert(e?.data?.message || 'Suppression impossible.') }
  finally { deleting.value = null }
}
</script>
<template>
  <AdminAdminShell title="Stages & sessions">
    <template #actions><NuxtLink to="/admin/stages/nouveau" class="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:bg-amber-300">Créer un stage</NuxtLink></template>
    <input v-model="search" type="search" placeholder="Titre, lieu ou slug…" class="mb-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
    <p v-if="pending" class="text-slate-600">Chargement…</p><p v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-5 font-medium text-red-700">Impossible de charger les stages.</p>
    <div v-else class="space-y-3"><article v-for="item in data?.stages" :key="item.id" class="admin-panel grid gap-4 rounded-2xl p-5 transition hover:border-sky-400/40 md:grid-cols-[1fr_auto] md:items-center"><div><div class="flex flex-wrap items-center gap-2"><h2 class="font-semibold text-slate-950">{{ item.titre }}</h2><span class="rounded-full px-2 py-1 text-[10px] font-bold" :class="item.estPublie ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">{{ item.estPublie ? 'PUBLIÉ' : 'BROUILLON' }}</span></div><p class="mt-1 text-sm text-slate-600">{{ item.lieuLabel }} · {{ guideName(item) }}</p><p class="mt-1 text-xs text-slate-500">{{ item._count.sessions }} session(s) · {{ item.discipline }}</p></div><div class="flex gap-2"><NuxtLink :to="`/admin/stages/${item.id}`" class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-amber-500 hover:text-slate-950">Modifier</NuxtLink><button :disabled="deleting === item.id" class="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="remove(item)">Supprimer</button></div></article><p v-if="!data?.stages.length" class="py-10 text-center text-slate-500">Aucun stage.</p></div>
  </AdminAdminShell>
</template>
