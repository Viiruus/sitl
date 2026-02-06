<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

const router = useRouter()
const route = useRoute()
const { clear, fetch } = useUserSession()

const [{ data: guideData }, { data: adventuresData, pending: adventuresPending, refresh: refreshAventures }, { data: suggestionsData, pending: suggestionsPending }] =
  await Promise.all([
    useFetch('/api/guides/me'),
    useFetch('/api/guides/aventures'),
    useFetch('/api/guides/suggestions'),
  ])

const guide = computed(() => guideData.value?.guide ?? null)
const aventures = computed(() => adventuresData.value?.aventures ?? [])
const suggestions = computed(() => suggestionsData.value?.suggestions ?? [])
const bookings = computed(() => [])

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Trad',
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
  dateFin: string
  placesTotales: number
  loading: boolean
  error: string | null
  success: string | null
}

const sessionForms = reactive<Record<string, SessionFormState>>({})

const ensureSessionForm = (slug: string) => {
  if (!sessionForms[slug]) {
    sessionForms[slug] = {
      open: false,
      dateDebut: '',
      dateFin: '',
      placesTotales: 6,
      loading: false,
      error: null,
      success: null,
    }
  }
  return sessionForms[slug]
}

const toggleSessionForm = (slug: string) => {
  const form = ensureSessionForm(slug)
  form.open = !form.open
  form.error = null
  form.success = null
}

const handleCreateSession = async (aventure: any) => {
  const form = ensureSessionForm(aventure.slug)
  form.error = null
  form.success = null

  const startDate = form.dateDebut ? new Date(form.dateDebut) : null
  const endDate = form.dateFin ? new Date(form.dateFin) : null

  if (!startDate || Number.isNaN(+startDate)) {
    form.error = 'Choisis une date de début.'
    return
  }
  if (endDate && endDate < startDate) {
    form.error = 'La date de fin doit être après la date de début.'
    return
  }
  const places = Number(form.placesTotales)
  if (!Number.isFinite(places) || places < 1) {
    form.error = 'Indique un nombre de places.'
    return
  }

  form.loading = true
  try {
    await $fetch(`/api/guides/aventures/${aventure.slug}/sessions`, {
      method: 'POST',
      body: {
        dateDebut: startDate.toISOString(),
        dateFin: endDate ? endDate.toISOString() : null,
        placesTotales: places,
      },
    })
    form.success = 'Session ajoutée.'
    form.dateDebut = ''
    form.dateFin = ''
    form.placesTotales = places
    await refreshAventures?.()
  } catch (error: any) {
    form.error = error?.data?.message || 'Impossible de créer la session.'
  } finally {
    form.loading = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1 space-y-10">
        <section id="bookings" class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
                Liste des stages
              </p>
              <h1 class="text-3xl font-semibold">
                Tes aventures organisées 
              </h1>
            </div>
            <NuxtLink
              to="/moniteurs/aventures/nouveau"
              class="inline-flex items-center justify-center rounded-full border border-secondaryBrand-400 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200 transition hover:bg-secondaryBrand-500/20"
            >
              + Nouvelle aventure
            </NuxtLink>
          </div>

          <div v-if="adventuresPending" class="mt-8 space-y-4">
            <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div v-else-if="!aventures.length" class="mt-8 rounded-2xl border border-dashed border-white/20 p-8 text-brand-100/70">
            Tu n’as pas encore publié d’aventures. Ajoute-les depuis ton back-office quand tu es prêt·e.
          </div>
          <div v-else class="mt-8 space-y-4">
            <div
              v-for="aventure in aventures"
              :key="aventure.id"
              class="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                      {{ formatDiscipline(aventure.discipline) }}
                    </p>
                    <h2 class="text-2xl font-semibold">{{ aventure.titre }}</h2>
                    <p class="text-sm text-brand-200/90">
                      {{ aventure.lieuLabel }}
                    </p>
                    <span
                      class="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      :class="aventure.estPublie ? 'border-secondaryBrand-400 text-secondaryBrand-200' : 'border-yellow-400/60 text-yellow-200'"
                    >
                      {{ aventure.estPublie ? 'Publié' : 'Brouillon' }}
                    </span>
                  </div>
                  <div class="flex flex-col items-stretch gap-2 lg:items-end">
                    <NuxtLink
                      :to="`/moniteurs/aventures/${aventure.slug}`"
                      class="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-secondaryBrand-400 hover:text-white"
                    >
                      Modifier
                    </NuxtLink>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full border border-secondaryBrand-300/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondaryBrand-100 transition hover:border-secondaryBrand-200"
                      @click="toggleSessionForm(aventure.slug)"
                    >
                      Ajouter une session
                    </button>
                    <NuxtLink
                      :to="{ name: 'moniteurs-aventures-slug-bookings', params: { slug: aventure.slug } }"
                      class="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-secondaryBrand-400 hover:text-white"
                    >
                      Gérer les inscriptions
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <div class="mt-4 grid gap-3 text-sm text-brand-100/80 sm:grid-cols-3">
                <div class="rounded-xl bg-white/5 p-3">
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Prochaine date</p>
                  <p class="font-semibold">
                    {{ aventure.prochainSession ? formatPeriod(aventure.prochainSession.dateDebut, aventure.prochainSession.dateFin) : 'À programmer' }}
                  </p>
                </div>
                <div class="rounded-xl bg-white/5 p-3">
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Sessions</p>
                  <p class="font-semibold">
                    {{ aventure.sessions.length }} programmée{{ aventure.sessions.length > 1 ? 's' : '' }}
                  </p>
                </div>
                <div class="rounded-xl bg-white/5 p-3">
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Inscriptions</p>
                  <p class="font-semibold">
                    {{ aventure.bookingsCount }} reçue{{ aventure.bookingsCount > 1 ? 's' : '' }}
                  </p>
                </div>
              </div>

              <div
                v-if="sessionForms[aventure.slug]?.open"
                class="mt-4 space-y-3 rounded-2xl border border-secondaryBrand-300/30 bg-brand-900/60 p-4"
              >
                <p class="text-sm font-semibold text-secondaryBrand-100">Ajouter une session</p>
                <div class="grid gap-3 sm:grid-cols-3">
                  <div class="space-y-1">
                    <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Date début</label>
                    <input
                      v-model="sessionForms[aventure.slug].dateDebut"
                      type="date"
                      class="w-full rounded-xl border border-white/10 bg-brand-950/70 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Date fin</label>
                    <input
                      v-model="sessionForms[aventure.slug].dateFin"
                      type="date"
                      class="w-full rounded-xl border border-white/10 bg-brand-950/70 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:opacity-50"
                    :disabled="sessionForms[aventure.slug].loading"
                    @click="handleCreateSession(aventure)"
                  >
                    <span v-if="sessionForms[aventure.slug].loading" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
                    <span>Créer la session</span>
                  </button>
                  <p v-if="sessionForms[aventure.slug].error" class="text-xs text-red-300">
                    {{ sessionForms[aventure.slug].error }}
                  </p>
                  <p v-if="sessionForms[aventure.slug].success" class="text-xs text-green-200">
                    {{ sessionForms[aventure.slug].success }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="demandes" class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Suggestions de dates
          </p>
          <h2 class="mt-2 text-2xl font-semibold">Les grimpeurs motivés</h2>

          <div v-if="suggestionsPending" class="mt-6 space-y-3">
            <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div v-else-if="!suggestions.length" class="mt-6 rounded-2xl border border-dashed border-white/20 p-6 text-sm text-brand-100/70">
            Aucun message pour le moment. Encourage tes grimpeurs à te proposer des dates depuis les fiches aventures.
          </div>
          <div v-else class="mt-6 space-y-4">
            <article
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              class="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="font-semibold">
                    {{ suggestion.user.firstName }} {{ suggestion.user.lastName }}
                  </p>
                  <p class="text-xs text-brand-200/80">{{ suggestion.user.email }}</p>
                </div>
                <p class="text-sm text-brand-100/80">
                  {{ formatPeriod(suggestion.startDate, suggestion.endDate) }}
                </p>
              </div>
              <p class="mt-3 text-sm text-brand-100/80">
                Pour : <span class="font-semibold">{{ suggestion.aventure.titre }}</span>
              </p>
              <p v-if="suggestion.comment" class="mt-2 text-sm text-brand-100/70">
                {{ suggestion.comment }}
              </p>
            </article>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
:deep(input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
