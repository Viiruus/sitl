<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

const router = useRouter()
const route = useRoute()
const { clear, fetch } = useUserSession()

const [{ data: guideData }, { data: adventuresData, pending: adventuresPending }, { data: suggestionsData, pending: suggestionsPending }, { data: bookingsData, pending: bookingsPending }] =
  await Promise.all([
    useFetch('/api/guides/me'),
    useFetch('/api/guides/aventures'),
    useFetch('/api/guides/suggestions'),
    useFetch('/api/guides/bookings'),
  ])

const guide = computed(() => guideData.value?.guide ?? null)
const aventures = computed(() => adventuresData.value?.aventures ?? [])
const suggestions = computed(() => suggestionsData.value?.suggestions ?? [])
const bookings = computed(() => bookingsData.value?.bookings ?? [])

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Trad',
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
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1 space-y-10">
        <section class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
                Mes aventures
              </p>
              <h1 class="text-3xl font-semibold">
                Tes stages publiés
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
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                    {{ formatDiscipline(aventure.discipline) }}
                  </p>
                  <h2 class="text-2xl font-semibold">{{ aventure.titre }}</h2>
                  <p class="text-sm text-brand-200/90">
                    {{ aventure.lieuLabel }}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <NuxtLink
                    :to="`/moniteurs/aventures/${aventure.slug}`"
                    class="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-secondaryBrand-400 hover:text-white"
                  >
                    Modifier
                  </NuxtLink>
                  <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                    :class="aventure.estPublie ? 'border-secondaryBrand-400 text-secondaryBrand-200' : 'border-yellow-400/60 text-yellow-200'"
                  >
                    {{ aventure.estPublie ? 'Publié' : 'Brouillon' }}
                  </span>
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
                  <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Bookings</p>
                  <p class="font-semibold">
                    {{ aventure.bookingsCount }} reçu{{ aventure.bookingsCount > 1 ? 's' : '' }}
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

        <section class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Bookings reçus
          </p>
          <h2 class="mt-2 text-2xl font-semibold">Suivi des réservations</h2>

          <div v-if="bookingsPending" class="mt-6 space-y-3">
            <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div v-else-if="!bookings.length" class="mt-6 rounded-2xl border border-dashed border-white/20 p-6 text-sm text-brand-100/70">
            Pas encore de réservations confirmées sur tes sessions. Continue de partager tes dates !
          </div>
          <div v-else class="mt-6 space-y-4">
            <article
              v-for="booking in bookings"
              :key="booking.id"
              class="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="font-semibold">
                    {{ booking.user.firstName }} {{ booking.user.lastName }}
                  </p>
                  <p class="text-xs text-brand-200/80">{{ booking.user.email }}</p>
                </div>
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  :class="booking.statut === 'CONFIRMEE'
                    ? 'bg-green-500/20 text-green-200'
                    : booking.statut === 'ANNULEE'
                      ? 'bg-red-500/20 text-red-200'
                      : 'bg-yellow-500/20 text-yellow-200'"
                >
                  {{ booking.statut.toLowerCase() }}
                </span>
              </div>
              <p class="mt-2 text-sm text-brand-100/80">
                Pour : <span class="font-semibold">{{ booking.session.aventure.titre }}</span> — {{ formatPeriod(booking.session.dateDebut, booking.session.dateFin) }}
              </p>
              <p class="text-sm text-brand-200/80">
                Participants : {{ booking.participants }} — Montant : {{ booking.montant }} €
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
