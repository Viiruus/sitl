<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/admin/bookings')
const { data: climberData } = await useFetch('/api/admin/users', { query: { role: 'CLIMBER' } })
const { data: stageData } = await useFetch('/api/admin/stages')
const climbers = computed(() => climberData.value?.users || [])
const sessions = computed(() => (stageData.value?.stages || []).flatMap((stage: any) => stage.sessions.map((session: any) => ({ ...session, stage }))))
const forms = reactive<Record<number, any>>({})
const busy = ref<number | 'new' | null>(null)
const message = ref('')
const actionError = ref('')
const newBooking = reactive<any>({ sessionId: '', userId: '', statut: 'EN_ATTENTE', participants: 1, montant: 0 })

watch(() => data.value?.bookings, (bookings) => {
  for (const key of Object.keys(forms)) delete forms[Number(key)]
  for (const booking of bookings || []) forms[booking.id] = {
    sessionId: booking.sessionId, userId: booking.userId, statut: booking.statut,
    participants: booking.participants, montant: booking.montant,
  }
}, { immediate: true })

const personName = (user: any) => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
const sessionLabel = (session: any) => `${session.stage.titre} · ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(session.dateDebut))}`
watch(() => newBooking.sessionId, (id) => {
  const session = sessions.value.find((item: any) => item.id === Number(id))
  if (session) newBooking.montant = session.stage.prixParPersonne ?? 0
})
const payload = (value: any) => ({ sessionId: Number(value.sessionId), userId: Number(value.userId), statut: value.statut, participants: Number(value.participants), montant: Number(value.montant) })
const createBooking = async () => {
  busy.value = 'new'; actionError.value = ''; message.value = ''
  try { await $fetch('/api/admin/bookings', { method: 'POST', body: payload(newBooking) }); await refresh(); message.value = 'Réservation créée.' }
  catch (e: any) { actionError.value = e?.data?.message || 'Création impossible.' }
  finally { busy.value = null }
}
const save = async (id: number) => {
  busy.value = id; actionError.value = ''; message.value = ''
  try { await $fetch(`/api/admin/bookings/${id}`, { method: 'PUT', body: payload(forms[id]) }); await refresh(); message.value = 'Réservation mise à jour.' }
  catch (e: any) { actionError.value = e?.data?.message || 'Modification impossible.' }
  finally { busy.value = null }
}
const remove = async (id: number) => {
  if (!window.confirm('Supprimer définitivement cette réservation ?')) return
  busy.value = id; actionError.value = ''; message.value = ''
  try { await $fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' }); await refresh(); message.value = 'Réservation supprimée.' }
  catch (e: any) { actionError.value = e?.data?.message || 'Suppression impossible.' }
  finally { busy.value = null }
}
const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
</script>

<template>
  <AdminAdminShell title="Réservations" eyebrow="Bookings">
    <p v-if="actionError" class="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ actionError }}</p>
    <p v-if="message" class="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{{ message }}</p>

    <form class="admin-panel mb-8 rounded-3xl p-6" @submit.prevent="createBooking">
      <h2 class="text-xl font-semibold">Créer une réservation</h2>
      <div class="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1.3fr_1fr_.6fr_.7fr_auto] lg:items-end">
        <label class="text-xs text-slate-600">Session<select v-model.number="newBooking.sessionId" required :class="inputClass" class="mt-1"><option value="" disabled>Sélectionner</option><option v-for="session in sessions" :key="session.id" :value="session.id">{{ sessionLabel(session) }}</option></select></label>
        <label class="text-xs text-slate-600">Grimpeur<select v-model.number="newBooking.userId" required :class="inputClass" class="mt-1"><option value="" disabled>Sélectionner</option><option v-for="climber in climbers" :key="climber.id" :value="climber.id">{{ personName(climber) }}</option></select></label>
        <label class="text-xs text-slate-600">Statut<select v-model="newBooking.statut" :class="inputClass" class="mt-1"><option v-for="value in ['EN_ATTENTE','CONFIRMEE','ANNULEE']" :key="value">{{ value }}</option></select></label>
        <label class="text-xs text-slate-600">Participants<input v-model.number="newBooking.participants" type="number" min="1" :class="inputClass" class="mt-1" /></label>
        <label class="text-xs text-slate-600">Montant (€)<input v-model.number="newBooking.montant" type="number" min="0" :class="inputClass" class="mt-1" /></label>
        <button :disabled="busy === 'new'" class="rounded-full bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50">Ajouter</button>
      </div>
    </form>

    <p v-if="pending" class="text-slate-600">Chargement…</p><p v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-5 font-medium text-red-700">Impossible de charger les réservations.</p>
    <div v-else class="space-y-4">
      <article v-for="booking in data?.bookings" :key="booking.id" class="admin-panel rounded-2xl p-5 transition hover:border-sky-400/30">
        <div class="mb-4"><p class="font-semibold">#{{ booking.id }} · {{ personName(booking.user) }}</p><p class="text-sm text-slate-600">{{ booking.session.aventure.titre }} · créée le {{ new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(booking.createdAt)) }}</p></div>
        <div v-if="forms[booking.id]" class="grid gap-3 lg:grid-cols-[1.5fr_1.3fr_1fr_.6fr_.7fr_auto] lg:items-end">
          <label class="text-xs text-slate-600">Session<select v-model.number="forms[booking.id].sessionId" :class="inputClass" class="mt-1"><option v-for="session in sessions" :key="session.id" :value="session.id">{{ sessionLabel(session) }}</option></select></label>
          <label class="text-xs text-slate-600">Grimpeur<select v-model.number="forms[booking.id].userId" :class="inputClass" class="mt-1"><option v-for="climber in climbers" :key="climber.id" :value="climber.id">{{ personName(climber) }}</option></select></label>
          <label class="text-xs text-slate-600">Statut<select v-model="forms[booking.id].statut" :class="inputClass" class="mt-1"><option v-for="value in ['EN_ATTENTE','CONFIRMEE','ANNULEE']" :key="value">{{ value }}</option></select></label>
          <label class="text-xs text-slate-600">Participants<input v-model.number="forms[booking.id].participants" type="number" min="1" :class="inputClass" class="mt-1" /></label>
          <label class="text-xs text-slate-600">Montant (€)<input v-model.number="forms[booking.id].montant" type="number" min="0" :class="inputClass" class="mt-1" /></label>
          <div class="flex gap-2"><button type="button" class="rounded-full bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950" @click="save(booking.id)">Sauver</button><button type="button" class="rounded-full border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50" @click="remove(booking.id)">Supprimer</button></div>
        </div>
      </article>
      <p v-if="!data?.bookings.length" class="py-10 text-center text-slate-500">Aucune réservation.</p>
    </div>
  </AdminAdminShell>
</template>
