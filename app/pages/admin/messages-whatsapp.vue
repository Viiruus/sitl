<script setup lang="ts">
import {
  GUIDE_WHATSAPP_KIND_LABELS,
  GUIDE_WHATSAPP_STATUS_LABELS,
  type GuideWhatsAppMessageKind,
} from '~~/shared/utils/guide-whatsapp-messages'

definePageMeta({ middleware: 'admin-auth' })
useSeoMeta({ title: 'Messages WhatsApp | Administration', robots: 'noindex, nofollow' })

const searchInput = ref('')
const filters = reactive({ search: '', kind: '', status: '', page: 1 })
const query = computed(() => ({
  page: filters.page,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.kind ? { kind: filters.kind } : {}),
  ...(filters.status ? { status: filters.status } : {}),
}))
const { data, pending, error, refresh } = await useFetch('/api/admin/whatsapp-messages', { query })

const applyFilters = () => {
  filters.search = searchInput.value.trim()
  filters.page = 1
}
const resetFilters = () => {
  searchInput.value = ''
  Object.assign(filters, { search: '', kind: '', status: '', page: 1 })
}
const changePage = (offset: number) => {
  filters.page = (data.value?.page || 1) + offset
}
const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris',
}).format(new Date(value))
const statusLabel = (status: string) => GUIDE_WHATSAPP_STATUS_LABELS[status as keyof typeof GUIDE_WHATSAPP_STATUS_LABELS] || status
const inputClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
</script>

<template>
  <AdminShell title="Messages WhatsApp" eyebrow="Messages aux moniteurs">
    <template #actions>
      <button type="button" :disabled="pending" class="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-amber-500 disabled:opacity-50" @click="refresh()">Actualiser</button>
    </template>

    <p class="mb-6 max-w-3xl text-sm leading-6 text-slate-600">
      Historique des messages adressés aux moniteurs, hors authentification. Les demandes particulières déjà conservées sont incluses ; les autres messages sont suivis à partir de l’activation de cet historique.
    </p>

    <form class="admin-panel mb-6 grid gap-4 rounded-3xl p-5 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto] xl:items-end" @submit.prevent="applyFilters">
      <label class="text-xs font-semibold">Moniteur ou numéro
        <input v-model="searchInput" type="search" placeholder="Nom ou numéro de téléphone" :class="inputClass" />
      </label>
      <label class="text-xs font-semibold">Type de message
        <select v-model="filters.kind" :class="inputClass" @change="filters.page = 1">
          <option value="">Tous les types</option>
          <option v-for="(label, kind) in GUIDE_WHATSAPP_KIND_LABELS" :key="kind" :value="kind">{{ label }}</option>
        </select>
      </label>
      <label class="text-xs font-semibold">Statut
        <select v-model="filters.status" :class="inputClass" @change="filters.page = 1">
          <option value="">Tous les statuts</option>
          <option v-for="(label, status) in GUIDE_WHATSAPP_STATUS_LABELS" :key="status" :value="status">{{ label }}</option>
        </select>
      </label>
      <div class="flex flex-wrap gap-2">
        <button type="submit" class="rounded-full bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">Rechercher</button>
        <button type="button" class="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100" @click="resetFilters">Réinitialiser</button>
      </div>
    </form>

    <p v-if="pending" role="status" class="py-10 text-center text-slate-600">Chargement des messages…</p>
    <div v-else-if="error" role="alert" class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
      <p>Impossible de charger les messages WhatsApp.</p>
      <button type="button" class="mt-3 underline" @click="refresh()">Réessayer</button>
    </div>
    <template v-else>
      <p class="mb-4 text-sm text-slate-600" role="status">{{ data?.total || 0 }} message{{ data?.total === 1 ? '' : 's' }}</p>
      <p v-if="!data?.messages.length" class="admin-panel rounded-3xl px-6 py-12 text-center text-slate-500">Aucun message correspondant à ces critères.</p>
      <div v-else class="space-y-4">
        <article v-for="message in data.messages" :key="message.id" class="admin-panel min-w-0 rounded-3xl p-5 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-wide text-amber-700">{{ GUIDE_WHATSAPP_KIND_LABELS[message.kind as GuideWhatsAppMessageKind] }}</p>
              <h2 class="mt-2 break-words text-lg font-semibold">
                <NuxtLink v-if="message.guideId" :to="`/admin/utilisateurs/${message.guideId}`" class="hover:underline">{{ message.guideName }}</NuxtLink>
                <span v-else>{{ message.guideName }}</span>
              </h2>
              <p class="mt-1 text-sm text-slate-600">{{ message.phoneNumber }}</p>
            </div>
            <div class="space-y-2 sm:text-right">
              <p class="text-xs text-slate-500">{{ message.sentAt ? 'Envoi' : 'Tentative' }} le {{ formatDate(message.sentAt || message.createdAt) }}</p>
              <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="message.status === 'failed' ? 'bg-red-100 text-red-800' : ['delivered', 'read'].includes(message.status) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'">{{ statusLabel(message.status) }}</span>
            </div>
          </div>

          <dl v-if="message.details.length" class="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div v-for="(detail, index) in message.details" :key="index" class="min-w-0" :class="detail.label === 'Message' ? 'sm:col-span-2' : ''">
              <dt class="text-xs font-semibold text-slate-500">{{ detail.label }}</dt>
              <dd class="mt-1 whitespace-pre-line break-words text-slate-900">{{ detail.value }}</dd>
            </div>
          </dl>
          <p v-if="message.failureReason" class="mt-4 whitespace-pre-line break-words rounded-xl bg-red-50 p-3 text-xs text-red-700">{{ message.failureReason }}</p>
          <details class="mt-4 text-xs text-slate-500">
            <summary class="cursor-pointer font-medium">Détails de l’envoi</summary>
            <dl class="mt-2 space-y-1 break-all">
              <div><dt class="inline font-semibold">Modèle : </dt><dd class="inline">{{ message.templateName }}</dd></div>
              <div><dt class="inline font-semibold">Langue : </dt><dd class="inline">{{ message.language }}</dd></div>
              <div v-if="message.messageId"><dt class="inline font-semibold">Identifiant WhatsApp : </dt><dd class="inline">{{ message.messageId }}</dd></div>
            </dl>
          </details>
        </article>
      </div>

      <nav v-if="data && data.pageCount > 1" aria-label="Pagination des messages" class="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" :disabled="data.page <= 1" class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40" @click="changePage(-1)">Précédent</button>
        <p class="text-sm text-slate-600">Page {{ data.page }} sur {{ data.pageCount }}</p>
        <button type="button" :disabled="data.page >= data.pageCount" class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40" @click="changePage(1)">Suivant</button>
      </nav>
    </template>
  </AdminShell>
</template>
