<script setup lang="ts">
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
const editingSessionForm = reactive<Record<number, { dateDebut: string; dateFin: string }>>({})
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
  if (!start) return 'Date à définir'
  const startStr = formatDate(start)
  if (!end) return startStr
  const endStr = formatDate(end)
  return startStr === endStr ? startStr : `${startStr} → ${endStr}`
}

const formatStatut = (value?: string | null) => {
  if (!value) return 'en attente'
  const lower = value.toLowerCase()
  if (lower === 'confirmee') return 'confirmée'
  if (lower === 'annulee') return 'annulée'
  return lower
}

const formatPhone = (user: any) => {
  const phone = user?.phoneNumber || ''
  if (!phone) return 'Numéro non fourni'
  return user?.whatsappOptIn ? `${phone} (WhatsApp)` : phone
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const addDaysToDateInput = (dateInput: string, daysToAdd: number) => {
  if (!dateInput) return ''
  const [year, month, day] = dateInput.split('-').map(Number)
  if (!year || !month || !day) return ''
  const utcDate = new Date(Date.UTC(year, month - 1, day))
  utcDate.setUTCDate(utcDate.getUTCDate() + daysToAdd)
  const nextYear = utcDate.getUTCFullYear()
  const nextMonth = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
  const nextDay = String(utcDate.getUTCDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(+date)) return ''
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const ensureEditingSessionForm = (group: { session: any }) => {
  const sessionId = Number(group.session.id)
  if (!editingSessionForm[sessionId]) {
    const startDate = toDateInputValue(group.session?.dateDebut)
    editingSessionForm[sessionId] = {
      dateDebut: startDate,
      dateFin: startDate
        ? addDaysToDateInput(startDate, Math.max(0, Number(aventure.value?.jours || 1) - 1))
        : toDateInputValue(group.session?.dateFin),
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
  form.dateFin = startDateInput
    ? addDaysToDateInput(startDateInput, Math.max(0, Number(aventure.value?.jours || 1) - 1))
    : ''
}

const saveSession = async (group: { session: any; bookings: any[] }) => {
  const sessionId = Number(group?.session?.id)
  if (!Number.isInteger(sessionId) || sessionId <= 0) return
  if (deletingSessionIds[sessionId] || savingSessionIds[sessionId]) return

  sessionActionError.value = null
  sessionActionSuccess.value = null

  const form = ensureEditingSessionForm(group)
  const startDate = form.dateDebut ? new Date(form.dateDebut) : null
  const endDate = form.dateFin ? new Date(form.dateFin) : null

  if (!startDate || Number.isNaN(+startDate)) {
    sessionActionError.value = 'Choisis une date de début.'
    return
  }
  if (endDate && endDate < startDate) {
    sessionActionError.value = 'La date de fin doit être après la date de début.'
    return
  }

  savingSessionIds[sessionId] = true
  try {
    await $fetch(`/api/guides/aventures/${slug.value}/sessions/${sessionId}`, {
      method: 'PUT',
      body: {
        dateDebut: startDate.toISOString(),
        dateFin: endDate ? endDate.toISOString() : null,
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
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1">
        <div class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">Inscriptions par aventure</p>
                <h1 class="text-3xl font-semibold">
                  {{ aventure?.titre || 'Inscriptions' }}
                </h1>
                <p class="text-sm text-brand-100/70">Gère les réservations pour cette aventure.</p>
              </div>
              <NuxtLink
                to="/moniteurs/aventures"
                class="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-brand-100/80 transition hover:border-secondaryBrand-400 hover:text-white"
              >
                ← Retour aux aventures
              </NuxtLink>
            </div>
          </div>

          <div v-if="pending" class="mt-6 space-y-3">
            <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div v-else-if="error" class="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
            Impossible de charger les inscriptions.
          </div>
          <div v-else-if="!sessions.length" class="mt-6 rounded-2xl border border-dashed border-white/20 p-8 text-brand-100/70">
            Aucune session planifiée pour cette aventure.
          </div>
          <div v-else class="mt-6 space-y-6">
            <div v-if="sessionActionSuccess" class="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-100">
              {{ sessionActionSuccess }}
            </div>
            <div v-if="sessionActionError" class="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
              {{ sessionActionError }}
            </div>
            <section
              v-for="group in bookingsBySession"
              :key="group.session.id"
              class="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-secondaryBrand-200">Session</p>
                  <h2 class="text-lg font-semibold text-white">
                    {{ formatPeriod(group.session.dateDebut, group.session.dateFin) }}
                  </h2>
                </div>
                <div class="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span class="text-sm text-brand-200/80">
                    {{ group.bookings.length }} réservation{{ group.bookings.length > 1 ? 's' : '' }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-full border border-secondaryBrand-300/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-100 transition hover:bg-secondaryBrand-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="deletingSessionIds[group.session.id] || savingSessionIds[group.session.id]"
                    @click="openEditSession(group)"
                  >
                    Modifier la session
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-full border border-red-400/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="deletingSessionIds[group.session.id] || savingSessionIds[group.session.id] || group.bookings.length > 0"
                    @click="deleteSession(group)"
                  >
                    <span
                      v-if="deletingSessionIds[group.session.id]"
                      class="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-100 border-t-transparent"
                    />
                    Supprimer la session
                  </button>
                </div>
              </div>
              <div
                v-if="editingSessionIds[group.session.id]"
                class="mt-4 rounded-2xl border border-secondaryBrand-300/30 bg-brand-900/60 p-4"
              >
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="text-sm font-semibold text-secondaryBrand-100">Modifier les dates</p>
                    <p class="text-xs text-brand-200/70">
                      Cette aventure dure {{ aventure?.jours || 1 }} jour{{ Number(aventure?.jours || 1) > 1 ? 's' : '' }}. Les inscrits restent rattachés à cette session.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="text-xs uppercase tracking-[0.2em] text-brand-200/70 transition hover:text-white"
                    @click="closeEditSession(group.session.id)"
                  >
                    Fermer
                  </button>
                </div>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  <div class="space-y-1">
                    <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Date début</label>
                    <input
                      :value="ensureEditingSessionForm(group).dateDebut"
                      type="date"
                      class="w-full rounded-xl border border-white/10 bg-brand-950/70 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                      @input="updateEditingSessionDateRange(group, ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Date fin</label>
                    <input
                      :value="ensureEditingSessionForm(group).dateFin"
                      type="date"
                      readonly
                      disabled
                      class="w-full cursor-not-allowed rounded-xl border border-white/10 bg-brand-900/40 px-3 py-2 text-white/70"
                    />
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:opacity-50"
                    :disabled="savingSessionIds[group.session.id] || deletingSessionIds[group.session.id]"
                    @click="saveSession(group)"
                  >
                    <span
                      v-if="savingSessionIds[group.session.id]"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent"
                    />
                    Enregistrer les dates
                  </button>
                  <p v-if="group.bookings.length" class="text-xs text-brand-200/70">
                    {{ group.bookings.length }} inscrit{{ group.bookings.length > 1 ? 's' : '' }} conservé{{ group.bookings.length > 1 ? 's' : '' }} sur cette session.
                  </p>
                </div>
              </div>
              <div class="mt-4 space-y-3">
                <div v-if="!group.bookings.length" class="rounded-xl border border-dashed border-white/20 bg-brand-900/40 p-4 text-sm text-brand-100/70">
                  Aucune réservation sur cette session pour le moment.
                </div>
                <article
                  v-for="booking in group.bookings"
                  :key="booking.id"
                  class="rounded-xl border border-white/10 bg-brand-900/60 p-4"
                >
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="font-semibold">{{ booking.user.firstName }} {{ booking.user.lastName }}</p>
                      <p class="text-xs text-brand-200/80">{{ booking.user.email }}</p>
                      <p class="text-xs text-brand-100/80 mt-1">📞 {{ formatPhone(booking.user) }}</p>
                    </div>
                    <span
                      class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      :class="booking.statut === 'CONFIRMEE'
                        ? 'bg-green-500/20 text-green-200'
                        : booking.statut === 'ANNULEE'
                          ? 'bg-red-500/20 text-red-200'
                          : 'bg-yellow-500/20 text-yellow-200'"
                    >
                      {{ formatStatut(booking.statut) }}
                    </span>
                  </div>
                  <p class="text-sm text-brand-200/80">
                    Participants : {{ booking.participants }} — Montant : {{ booking.montant }} €
                  </p>
                  <p class="text-xs text-brand-300/80">Réservation créée le {{ formatDate(booking.createdAt) }}</p>
                </article>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
