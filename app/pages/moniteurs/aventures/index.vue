<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
import {
  computeSessionEndFromDuration,
  formatDurationDays,
  SESSION_HALF_DAY_LABELS,
  type SessionHalfDay,
} from '~~/shared/utils/aventure-schedule'

definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Mes aventures',
  description: 'Crée, publie et gère tes aventures d’escalade.',
  robots: 'noindex, nofollow',
})

const router = useRouter()
const route = useRoute()
const { clear, fetch } = useUserSession()

const [
  { data: guideData },
  { data: adventuresData, pending: adventuresPending, refresh: refreshAventures },
] =
  await Promise.all([
    useFetch('/api/guides/me'),
    useFetch('/api/guides/aventures'),
  ])

const guide = computed(() => guideData.value?.guide ?? null)
const aventures = computed(() => adventuresData.value?.aventures ?? [])
const bookings = computed(() => [])

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Terrain d\'aventure',
  VIA_FERRATA: 'Via ferrata',
}

const formatDiscipline = (value?: string | null) => (value ? disciplineLabels[value] ?? value : 'Aventure')

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
  if (!start) return 'Départ à définir'
  const startStr = formatDate(start)
  if (!end) return startStr
  const endStr = formatDate(end)
  return startStr === endStr ? startStr : `${startStr} → ${endStr}`
}

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}

type SessionFormState = {
  open: boolean
  dateDebut: string
  demiJourneeDebut: SessionHalfDay
  dateFin: string
  demiJourneeFin: SessionHalfDay
  loading: boolean
  error: string | null
  success: string | null
}

const sessionForms = reactive<Record<string, SessionFormState>>({})

type AdventureActionState = {
  publishing: boolean
  depublishing: boolean
  deleting: boolean
  error: string | null
}

const adventureActions = reactive<Record<string, AdventureActionState>>({})

const ensureSessionForm = (slug: string) => {
  if (!sessionForms[slug]) {
    sessionForms[slug] = {
      open: false,
      dateDebut: '',
      demiJourneeDebut: 'AM',
      dateFin: '',
      demiJourneeFin: 'PM',
      loading: false,
      error: null,
      success: null,
    }
  }
  return sessionForms[slug]
}

const ensureAdventureActionState = (slug: string) => {
  if (!adventureActions[slug]) {
    adventureActions[slug] = {
      publishing: false,
      depublishing: false,
      deleting: false,
      error: null,
    }
  }
  return adventureActions[slug]
}

const toggleSessionForm = (slug: string) => {
  const form = ensureSessionForm(slug)
  form.open = !form.open
  form.error = null
  form.success = null
}

const updateSessionDateRange = (aventure: any, startDateInput: string) => {
  const form = ensureSessionForm(aventure.slug)
  form.dateDebut = startDateInput
  const computedRange = computeSessionEndFromDuration(startDateInput, form.demiJourneeDebut, Number(aventure.jours || 0))
  form.dateFin = computedRange?.dateFinInput || ''
  form.demiJourneeFin = computedRange?.endHalfDay || 'PM'
}

const updateSessionHalfDayRange = (aventure: any, startHalfDay: SessionHalfDay) => {
  const form = ensureSessionForm(aventure.slug)
  form.demiJourneeDebut = startHalfDay
  const computedRange = computeSessionEndFromDuration(form.dateDebut, startHalfDay, Number(aventure.jours || 0))
  form.dateFin = computedRange?.dateFinInput || ''
  form.demiJourneeFin = computedRange?.endHalfDay || 'PM'
}

const handleCreateSession = async (aventure: any) => {
  const form = ensureSessionForm(aventure.slug)
  form.error = null
  form.success = null

  if (!form.dateDebut) {
    form.error = 'Choisis une date de début.'
    return
  }
  const computedRange = computeSessionEndFromDuration(form.dateDebut, form.demiJourneeDebut, Number(aventure.jours || 0))
  if (!computedRange?.dateDebut || !computedRange?.dateFin) {
    form.error = `La session doit couvrir exactement ${formatDurationDays(aventure.jours)}.`
    return
  }
  form.loading = true
  try {
    await $fetch(`/api/guides/aventures/${aventure.slug}/sessions`, {
      method: 'POST',
      body: {
        dateDebut: form.dateDebut,
        demiJourneeDebut: form.demiJourneeDebut,
      },
    })
    form.success = 'Session ajoutée.'
    form.dateDebut = ''
    form.demiJourneeDebut = 'AM'
    form.dateFin = ''
    form.demiJourneeFin = 'PM'
    await refreshAventures?.()
  } catch (error: any) {
    form.error = error?.data?.message || 'Impossible de créer la session.'
  } finally {
    form.loading = false
  }
}

const handleDepublishAdventure = async (aventure: any) => {
  const actionState = ensureAdventureActionState(aventure.slug)
  actionState.error = null
  if (actionState.publishing || actionState.depublishing || actionState.deleting) {
    return
  }
  if (typeof window !== 'undefined') {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir dé-publier votre stage ? Il retournera à l\'état de brouillon.')
    if (!confirmed) {
      return
    }
  }
  actionState.depublishing = true
  try {
    await $fetch(`/api/guides/aventures/${aventure.slug}/status`, {
      method: 'PUT',
      body: {
        estPublie: false,
      },
    })
    await refreshAventures?.()
  } catch (error: any) {
    actionState.error = error?.data?.message || 'Impossible de dé-publier ce stage.'
  } finally {
    actionState.depublishing = false
  }
}

const handlePublishAdventure = async (aventure: any) => {
  const actionState = ensureAdventureActionState(aventure.slug)
  actionState.error = null
  if (actionState.publishing || actionState.depublishing || actionState.deleting) {
    return
  }
  actionState.publishing = true
  try {
    await $fetch(`/api/guides/aventures/${aventure.slug}/status`, {
      method: 'PUT',
      body: {
        estPublie: true,
      },
    })
    await refreshAventures?.()
  } catch (error: any) {
    actionState.error = error?.data?.message || 'Impossible de publier ce stage.'
  } finally {
    actionState.publishing = false
  }
}

const handleDeleteAdventure = async (aventure: any) => {
  const actionState = ensureAdventureActionState(aventure.slug)
  actionState.error = null
  if (actionState.publishing || actionState.depublishing || actionState.deleting) {
    return
  }
  if (typeof window !== 'undefined') {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')
    if (!confirmed) {
      return
    }
  }
  actionState.deleting = true
  try {
    await $fetch(`/api/guides/aventures/${aventure.slug}`, {
      method: 'DELETE',
    })
    await refreshAventures?.()
  } catch (error: any) {
    actionState.error = error?.data?.message || 'Impossible de supprimer ce stage.'
  } finally {
    actionState.deleting = false
  }
}

</script>

<template>
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <section id="bookings" class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-amber-700">
            Liste des stages
          </p>
          <h1 class="text-3xl font-semibold">
            Tes aventures organisées
          </h1>
        </div>
        <NuxtLink
          to="/moniteurs/aventures/nouveau"
          class="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-700 transition hover:bg-amber-50"
        >
          + Nouvelle aventure
        </NuxtLink>
      </div>

      <div v-if="adventuresPending" class="mt-8 space-y-4">
        <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <div v-else-if="!aventures.length" class="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-slate-600">
        Tu n’as pas encore publié d’aventures. Ajoute-les depuis ton back-office quand tu es prêt·e.
      </div>
      <div v-else class="mt-8 space-y-4">
        <div
          v-for="aventure in aventures"
          :key="aventure.id"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {{ formatDiscipline(aventure.discipline) }}
                </p>
                <h2 class="text-2xl font-semibold">{{ aventure.titre }}</h2>
                <p class="text-sm text-slate-500">
                  {{ aventure.lieuLabel }}
                </p>
                <span
                  class="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  :class="aventure.estPublie ? 'border-amber-200 text-amber-700' : 'border-amber-200 text-amber-700'"
                >
                  {{ aventure.estPublie ? 'Publié' : 'Brouillon' }}
                </span>
              </div>
              <div class="flex flex-col items-stretch gap-2 lg:items-end">
                <NuxtLink
                  :to="`/moniteurs/aventures/${aventure.slug}`"
                  class="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:border-amber-200 hover:text-slate-900"
                >
                  Modifier
                </NuxtLink>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 transition hover:border-amber-200"
                  @click="toggleSessionForm(aventure.slug)"
                >
                  Ajouter une session
                </button>
                <NuxtLink
                  :to="{ name: 'moniteurs-aventures-slug-bookings', params: { slug: aventure.slug } }"
                  class="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:border-amber-200 hover:text-slate-900"
                >
                  Gérer les inscriptions
                </NuxtLink>
                <button
                  v-if="!aventure.estPublie"
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 transition hover:border-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="!aventure.sessions.length || adventureActions[aventure.slug]?.publishing || adventureActions[aventure.slug]?.deleting || adventureActions[aventure.slug]?.depublishing"
                  @click="handlePublishAdventure(aventure)"
                >
                  Publier
                </button>
                <p
                  v-if="!aventure.estPublie && !aventure.sessions.length"
                  class="text-right text-[11px] text-amber-700"
                >
                  Ajoute une session pour publier.
                </p>
                <button
                  v-if="aventure.estPublie"
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 transition hover:border-amber-200 disabled:opacity-50"
                  :disabled="adventureActions[aventure.slug]?.publishing || adventureActions[aventure.slug]?.depublishing || adventureActions[aventure.slug]?.deleting"
                  @click="handleDepublishAdventure(aventure)"
                >
                  Dé-publier
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                  :disabled="adventureActions[aventure.slug]?.publishing || adventureActions[aventure.slug]?.deleting || adventureActions[aventure.slug]?.depublishing"
                  @click="handleDeleteAdventure(aventure)"
                >
                  Supprimer
                </button>
                <p v-if="adventureActions[aventure.slug]?.error" class="text-right text-xs text-red-700">
                  {{ adventureActions[aventure.slug]?.error }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div class="rounded-xl bg-white p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Prochaine date</p>
              <p class="font-semibold">
                {{ aventure.prochainSession ? formatPeriod(aventure.prochainSession.dateDebut, aventure.prochainSession.dateFin) : 'À programmer' }}
              </p>
            </div>
            <div class="rounded-xl bg-white p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Sessions</p>
              <p class="font-semibold">
                {{ aventure.sessions.length }} programmée{{ aventure.sessions.length > 1 ? 's' : '' }}
              </p>
            </div>
            <div class="rounded-xl bg-white p-3">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Inscriptions</p>
              <p class="font-semibold">
                {{ aventure.bookingsCount }} reçue{{ aventure.bookingsCount > 1 ? 's' : '' }}
              </p>
            </div>
          </div>

          <div
            v-if="sessionForms[aventure.slug]?.open"
            class="mt-4 space-y-3 rounded-2xl border border-amber-200 bg-slate-50 p-4"
          >
            <p class="text-sm font-semibold text-amber-700">Ajouter une session</p>
            <p class="text-xs text-slate-500">
              Cette aventure dure {{ formatDurationDays(aventure.jours) }}. La session doit couvrir exactement cette durée.
            </p>
            <div class="grid gap-3 sm:grid-cols-4">
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Date début</label>
                <input
                  :value="sessionForms[aventure.slug].dateDebut"
                  type="date"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-amber-200 focus:outline-none"
                  @input="updateSessionDateRange(aventure, ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Début</label>
                <select
                  :value="sessionForms[aventure.slug].demiJourneeDebut"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-amber-200 focus:outline-none"
                  @change="updateSessionHalfDayRange(aventure, ($event.target as HTMLSelectElement).value as SessionHalfDay)"
                >
                  <option value="AM">{{ SESSION_HALF_DAY_LABELS.AM }}</option>
                  <option value="PM">{{ SESSION_HALF_DAY_LABELS.PM }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Date fin</label>
                <input
                  :value="sessionForms[aventure.slug].dateFin"
                  type="date"
                  readonly
                  disabled
                  class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[11px] uppercase tracking-[0.3em] text-slate-500">Fin</label>
                <input
                  :value="SESSION_HALF_DAY_LABELS[sessionForms[aventure.slug].demiJourneeFin]"
                  type="text"
                  readonly
                  disabled
                  class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900"
                />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-amber-500/10 transition hover:bg-amber-300 disabled:opacity-50"
                :disabled="sessionForms[aventure.slug].loading"
                @click="handleCreateSession(aventure)"
              >
                <span v-if="sessionForms[aventure.slug].loading" class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                <span>Créer la session</span>
              </button>
              <p v-if="sessionForms[aventure.slug].error" class="text-xs text-red-700">
                {{ sessionForms[aventure.slug].error }}
              </p>
              <p v-if="sessionForms[aventure.slug].success" class="text-xs text-emerald-700">
                {{ sessionForms[aventure.slug].success }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </GuideShell>
</template>
