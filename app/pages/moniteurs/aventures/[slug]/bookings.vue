<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
import {
  computeSessionEndFromDuration,
  formatDurationDays,
  formatSessionRangeLabel,
  getSessionHalfDayBounds,
  SESSION_HALF_DAY_LABELS,
  toDateInputValue,
  type SessionHalfDay,
} from '~~/shared/utils/aventure-schedule'

definePageMeta({
  middleware: 'guide-auth',
})

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { clear, fetch } = useUserSession()
const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const { data, pending, error, refresh } = await useFetch(() => (slug.value ? `/api/guides/aventures/${slug.value}/bookings` : null), {
  watch: [slug],
})

const aventure = computed(() => data.value?.aventure || null)
const sessions = computed(() => data.value?.sessions || [])
const bookings = computed(() => data.value?.bookings || [])
const deletingSessionIds = reactive<Record<number, boolean>>({})
const savingSessionIds = reactive<Record<number, boolean>>({})
const editingSessionIds = reactive<Record<number, boolean>>({})
const editingSessionForm = reactive<Record<number, {
  dateDebut: string
  demiJourneeDebut: SessionHalfDay
  dateFin: string
  demiJourneeFin: SessionHalfDay
}>>({})
const sessionActionError = ref<string | null>(null)
const sessionActionSuccess = ref<string | null>(null)
useSeoMeta(() => ({
  title: aventure.value?.titre ? `Inscriptions : ${aventure.value.titre}` : 'Inscriptions aventure',
  description: 'Gère les réservations et contacts pour cette aventure.',
  robots: 'noindex, nofollow',
}))

const bookingsBySession = computed(() => {
  const map = new Map<number, { session: any; bookings: any[] }>()
  for (const session of sessions.value) {
    map.set(session.id, { session, bookings: [] })
  }
  for (const booking of bookings.value) {
    const session = booking.session
    if (!session) continue
    if (!map.has(session.id)) {
      map.set(session.id, { session, bookings: [] })
    }
    map.get(session.id)!.bookings.push(booking)
  }
  return Array.from(map.values()).sort((a, b) => +new Date(a.session.dateDebut) - +new Date(b.session.dateDebut))
})

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Date à définir'
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatter.format(new Date(value))
}

const formatPeriod = (start?: string | Date | null, end?: string | Date | null) => {
  return formatSessionRangeLabel(start, end) || 'Date à définir'
}

const formatPhone = (user: any) => {
  const phone = user?.phoneNumber || ''
  if (!phone) return 'Numéro non fourni'
  return user?.whatsappOptIn ? `${phone} (WhatsApp)` : phone
}

const ensureEditingSessionForm = (group: { session: any }) => {
  const sessionId = Number(group.session.id)
  if (!editingSessionForm[sessionId]) {
    const startDate = toDateInputValue(group.session?.dateDebut)
    const bounds = getSessionHalfDayBounds(group.session?.dateDebut, group.session?.dateFin)
    const startHalfDay = bounds?.startHalfDay || 'AM'
    const computedRange = computeSessionEndFromDuration(startDate, startHalfDay, Number(aventure.value?.jours || 0))
    editingSessionForm[sessionId] = {
      dateDebut: startDate,
      demiJourneeDebut: startHalfDay,
      dateFin: computedRange?.dateFinInput || toDateInputValue(group.session?.dateFin),
      demiJourneeFin: computedRange?.endHalfDay || bounds?.endHalfDay || 'PM',
    }
  }
  return editingSessionForm[sessionId]
}

const openEditSession = (group: { session: any }) => {
  sessionActionError.value = null
  sessionActionSuccess.value = null
  const sessionId = Number(group.session.id)
  if (!Number.isInteger(sessionId) || sessionId <= 0) return
  ensureEditingSessionForm(group)
  editingSessionIds[sessionId] = true
}

const closeEditSession = (sessionId: number) => {
  editingSessionIds[sessionId] = false
}

const updateEditingSessionDateRange = (group: { session: any }, startDateInput: string) => {
  const form = ensureEditingSessionForm(group)
  form.dateDebut = startDateInput
  const computedRange = computeSessionEndFromDuration(startDateInput, form.demiJourneeDebut, Number(aventure.value?.jours || 0))
  form.dateFin = computedRange?.dateFinInput || ''
  form.demiJourneeFin = computedRange?.endHalfDay || 'PM'
}

const updateEditingSessionHalfDayRange = (group: { session: any }, startHalfDay: SessionHalfDay) => {
  const form = ensureEditingSessionForm(group)
  form.demiJourneeDebut = startHalfDay
  const computedRange = computeSessionEndFromDuration(form.dateDebut, startHalfDay, Number(aventure.value?.jours || 0))
  form.dateFin = computedRange?.dateFinInput || ''
  form.demiJourneeFin = computedRange?.endHalfDay || 'PM'
}

const saveSession = async (group: { session: any; bookings: any[] }) => {
  const sessionId = Number(group?.session?.id)
  if (!Number.isInteger(sessionId) || sessionId <= 0) return
  if (deletingSessionIds[sessionId] || savingSessionIds[sessionId]) return

  sessionActionError.value = null
  sessionActionSuccess.value = null

  const form = ensureEditingSessionForm(group)
  if (!form.dateDebut) {
    sessionActionError.value = 'Choisis une date de début.'
    return
  }
  const computedRange = computeSessionEndFromDuration(form.dateDebut, form.demiJourneeDebut, Number(aventure.value?.jours || 0))
  if (!computedRange?.dateDebut || !computedRange?.dateFin) {
    sessionActionError.value = `La session doit couvrir exactement ${formatDurationDays(aventure.value?.jours)}.`
    return
  }

  savingSessionIds[sessionId] = true
  try {
    await $fetch(`/api/guides/aventures/${slug.value}/sessions/${sessionId}`, {
      method: 'PUT',
      body: {
        dateDebut: form.dateDebut,
        demiJourneeDebut: form.demiJourneeDebut,
      },
    })
    sessionActionSuccess.value = group.bookings.length > 0
      ? 'Session modifiée. Les inscrits sont conservés sur cette session.'
      : 'Session modifiée.'
    editingSessionIds[sessionId] = false
    await refresh()
  } catch (error: any) {
    sessionActionError.value = error?.data?.message || 'Impossible de modifier cette session.'
  } finally {
    savingSessionIds[sessionId] = false
  }
}

const deleteSession = async (group: { session: any; bookings: any[] }) => {
  const sessionId = Number(group?.session?.id)
  if (!Number.isInteger(sessionId) || sessionId <= 0) return
  if (deletingSessionIds[sessionId]) return

  sessionActionError.value = null
  sessionActionSuccess.value = null

  if (group.bookings.length > 0) {
    sessionActionError.value = 'Impossible de supprimer une session qui contient déjà des inscrits.'
    return
  }

  if (typeof window !== 'undefined') {
    const period = formatPeriod(group.session?.dateDebut, group.session?.dateFin)
    const confirmed = window.confirm(`Supprimer la session "${period}" ?`)
    if (!confirmed) return
  }

  deletingSessionIds[sessionId] = true
  try {
    const response: any = await $fetch(`/api/guides/aventures/${slug.value}/sessions/${sessionId}`, {
      method: 'DELETE',
    })
    sessionActionSuccess.value = response?.unpublishedAventure
      ? 'Session supprimée. Le stage a été dépublié car il ne reste plus aucune session.'
      : 'Session supprimée.'
    await refresh()
  } catch (error: any) {
    sessionActionError.value = error?.data?.message || 'Impossible de supprimer cette session.'
  } finally {
    deletingSessionIds[sessionId] = false
  }
}
</script>

<template>
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <div class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-amber-700">Inscriptions par aventure</p>
            <h1 class="text-3xl font-semibold">
              {{ aventure?.titre || 'Inscriptions' }}
            </h1>
            <p class="text-sm text-slate-600">Gère les réservations pour cette aventure.</p>
          </div>
          <NuxtLink
            to="/moniteurs/aventures"
            class="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-slate-900"
          >
            ← Retour aux aventures
          </NuxtLink>
        </div>
      </div>

      <div v-if="pending" class="mt-6 space-y-3">
        <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <div v-else-if="error" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Impossible de charger les inscriptions.
      </div>
      <div v-else-if="!sessions.length" class="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-slate-600">
        Aucune session planifiée pour cette aventure.
      </div>
      <div v-else class="mt-6 space-y-6">
        <div v-if="sessionActionSuccess" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {{ sessionActionSuccess }}
        </div>
        <div v-if="sessionActionError" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {{ sessionActionError }}
        </div>
        <section
          v-for="group in bookingsBySession"
          :key="group.session.id"
          class="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-amber-700">Session</p>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ formatPeriod(group.session.dateDebut, group.session.dateFin) }}
              </h2>
            </div>
            <div class="flex flex-wrap items-center gap-3 sm:justify-end">
              <span class="text-sm text-slate-500">
                {{ group.bookings.length }} réservation{{ group.bookings.length > 1 ? 's' : '' }}
              </span>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="deletingSessionIds[group.session.id] || savingSessionIds[group.session.id]"
                @click="openEditSession(group)"
              >
                Modifier la session
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="deletingSessionIds[group.session.id] || savingSessionIds[group.session.id] || group.bookings.length > 0"
                @click="deleteSession(group)"
              >
                <span
                  v-if="deletingSessionIds[group.session.id]"
                  class="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-200 border-t-transparent"
                />
                Supprimer la session
              </button>
            </div>
          </div>
          <div
            v-if="editingSessionIds[group.session.id]"
            class="mt-4 rounded-2xl border border-amber-200 bg-slate-50 p-4"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-sm font-semibold text-amber-700">Modifier les dates</p>
                <p class="text-xs text-slate-500">
                  Cette aventure dure {{ formatDurationDays(aventure?.jours || 1) }}. Les inscrits restent rattachés à cette session.
                </p>
              </div>
              <button
                type="button"
                class="text-xs uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900"
                @click="closeEditSession(group.session.id)"
              >
                Fermer
              </button>
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-4">
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Date début</label>
                <input
                  :value="ensureEditingSessionForm(group).dateDebut"
                  type="date"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-amber-200 focus:outline-none"
                  @input="updateEditingSessionDateRange(group, ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Début</label>
                <select
                  :value="ensureEditingSessionForm(group).demiJourneeDebut"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-amber-200 focus:outline-none"
                  @change="updateEditingSessionHalfDayRange(group, ($event.target as HTMLSelectElement).value as SessionHalfDay)"
                >
                  <option value="AM">{{ SESSION_HALF_DAY_LABELS.AM }}</option>
                  <option value="PM">{{ SESSION_HALF_DAY_LABELS.PM }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Date fin</label>
                <input
                  :value="ensureEditingSessionForm(group).dateFin"
                  type="date"
                  readonly
                  disabled
                  class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Fin</label>
                <input
                  :value="SESSION_HALF_DAY_LABELS[ensureEditingSessionForm(group).demiJourneeFin]"
                  type="text"
                  readonly
                  disabled
                  class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-amber-500/10 transition hover:bg-amber-300 disabled:opacity-50"
                :disabled="savingSessionIds[group.session.id] || deletingSessionIds[group.session.id]"
                @click="saveSession(group)"
              >
                <span
                  v-if="savingSessionIds[group.session.id]"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent"
                />
                Enregistrer les dates
              </button>
              <p v-if="group.bookings.length" class="text-xs text-slate-500">
                {{ group.bookings.length }} inscrit{{ group.bookings.length > 1 ? 's' : '' }} conservé{{ group.bookings.length > 1 ? 's' : '' }} sur cette session.
              </p>
            </div>
          </div>
          <div class="mt-4 space-y-3">
            <div v-if="!group.bookings.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Aucune réservation sur cette session pour le moment.
            </div>
            <article
              v-for="booking in group.bookings"
              :key="booking.id"
              class="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <p class="font-semibold">{{ booking.user.firstName }} {{ booking.user.lastName }}</p>
                <p class="text-xs text-slate-500">{{ booking.user.email }}</p>
                <p class="text-xs text-slate-600 mt-1">📞 {{ formatPhone(booking.user) }}</p>
              </div>
              <p class="text-sm text-slate-500">
                Participants : {{ booking.participants }} — Montant : {{ booking.montant }} €
              </p>
              <p class="text-xs text-slate-500">Réservation créée le {{ formatDate(booking.createdAt) }}</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </GuideShell>
</template>
