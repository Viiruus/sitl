<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const role = ref(route.query.role === 'GUIDE' || route.query.role === 'CLIMBER' ? route.query.role : '')
const query = computed(() => ({ ...(search.value ? { search: search.value } : {}), ...(role.value ? { role: role.value } : {}) }))
const { data, pending, error, refresh } = await useFetch('/api/admin/users', { query, watch: [query] })
const deleting = ref<number | null>(null)

watch(query, (value) => router.replace({ query: value }), { deep: true })
const name = (user: any) => [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sans nom'
const remove = async (user: any) => {
  if (!window.confirm(`Supprimer définitivement le compte de ${name(user)} et ses données liées ?`)) return
  deleting.value = user.id
  try { await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' }); await refresh() }
  catch (e: any) { window.alert(e?.data?.message || 'Suppression impossible.') }
  finally { deleting.value = null }
}
</script>

<template>
  <AdminAdminShell title="Moniteurs & grimpeurs">
    <template #actions><NuxtLink to="/admin/utilisateurs/nouveau" class="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:bg-amber-300">Créer un compte</NuxtLink></template>
    <div class="admin-panel mb-6 grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_220px]">
      <input v-model="search" type="search" placeholder="Nom, email ou téléphone…" class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
      <select v-model="role" class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200">
        <option value="">Tous les profils</option><option value="GUIDE">Moniteurs</option><option value="CLIMBER">Grimpeurs</option>
      </select>
    </div>
    <p v-if="pending" class="text-slate-600">Chargement…</p>
    <p v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-5 font-medium text-red-700">Impossible de charger les comptes.</p>
    <div v-else class="admin-panel overflow-hidden rounded-2xl">
      <div v-for="user in data?.users" :key="user.id" class="grid gap-4 border-b border-slate-200 p-5 transition last:border-0 hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2"><p class="font-semibold text-slate-950">{{ name(user) }}</p><span class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{{ user.role === 'GUIDE' ? 'MONITEUR' : 'GRIMPEUR' }}</span><span v-if="user.isAdmin" class="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">ADMIN</span></div>
          <p class="mt-1 truncate text-sm text-slate-600">{{ user.email }} · {{ user.phoneNumber || 'sans téléphone' }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ user.role === 'GUIDE' ? `${user._count.aventures} stage(s) · ${user.guideProfile?.baseLocation || 'camp non renseigné'}` : `${user._count.bookings} réservation(s)` }}</p>
        </div>
        <div class="flex gap-2"><NuxtLink :to="`/admin/utilisateurs/${user.id}`" class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-amber-500 hover:text-slate-950">Modifier</NuxtLink><button class="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" :disabled="deleting === user.id" @click="remove(user)">Supprimer</button></div>
      </div>
      <p v-if="!data?.users.length" class="p-8 text-center text-slate-600">Aucun compte trouvé.</p>
    </div>
  </AdminAdminShell>
</template>
