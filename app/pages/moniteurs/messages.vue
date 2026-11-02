<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Mes messages',
  description: 'Retrouve les suggestions de dates et les demandes particulières des grimpeur·euse·s.',
  robots: 'noindex, nofollow',
})

const router = useRouter()
const route = useRoute()
const { clear, fetch } = useUserSession()

const [
  { data: guideData },
  { data: suggestionsData, pending: suggestionsPending, error: suggestionsError, refresh: refreshSuggestions },
  { data: contactRequestsData, pending: contactRequestsPending, error: contactRequestsError, refresh: refreshContactRequests },
] = await Promise.all([
  useFetch('/api/guides/me'),
  useFetch('/api/guides/suggestions'),
  useFetch('/api/guides/contact-requests'),
])

const guide = computed(() => guideData.value?.guide ?? null)
const suggestions = computed(() => suggestionsData.value?.suggestions ?? [])
const contactRequests = computed(() => contactRequestsData.value?.contactRequests ?? [])

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Date à définir'
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatter.format(new Date(value))
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return 'Date à définir'
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

const contactRequestName = (request: any) => {
  const fallback = request?.climberNameSnapshot?.trim()
  const fullName = [request?.climber?.firstName, request?.climber?.lastName].filter(Boolean).join(' ').trim()
  return fallback || fullName || 'Grimpeur·euse'
}

const contactRequestPhone = (request: any) => request?.climberPhoneSnapshot || null

const contactRequestStatusLabel = (value?: string | null) => {
  switch (value) {
    case 'accepted':
      return 'Envoyé sur WhatsApp'
    case 'delivered':
      return 'Distribué'
    case 'read':
      return 'Lu'
    case 'failed':
      return 'Échec d’envoi'
    case 'sent':
      return 'Envoyé'
    default:
      return 'Enregistré'
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="min-w-0 flex-1 space-y-10">
        <header class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <h1 class="text-3xl font-semibold">Mes messages</h1>
          <p class="mt-3 text-brand-100/80">
            Retrouve les suggestions de dates pour tes aventures et les demandes particulières reçues depuis ton profil.
          </p>
        </header>

        <section id="demandes" class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Suggestions de dates
          </p>
          <h2 class="mt-2 text-2xl font-semibold">Les grimpeur·euse·s motivé·e·s</h2>

          <div v-if="suggestionsPending" class="mt-6 space-y-3">
            <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div v-else-if="suggestionsError" role="alert" class="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">
            <p>Impossible de charger les suggestions de dates.</p>
            <button type="button" class="mt-3 rounded-xl border border-white/20 px-4 py-2 font-semibold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300" @click="refreshSuggestions()">
              Réessayer
            </button>
          </div>
          <div v-else-if="!suggestions.length" class="mt-6 rounded-2xl border border-dashed border-white/20 p-6 text-sm text-brand-100/70">
            Aucun message pour le moment. Encourage tes grimpeur·euse·s à te proposer des dates depuis les fiches aventures.
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

        <section id="demandes-particulieres" class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Demandes particulières
          </p>
          <h2 class="mt-2 text-2xl font-semibold">Les messages reçus depuis ton profil</h2>

          <div v-if="contactRequestsPending" class="mt-6 space-y-3">
            <div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div v-else-if="contactRequestsError" role="alert" class="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">
            <p>Impossible de charger les demandes particulières.</p>
            <button type="button" class="mt-3 rounded-xl border border-white/20 px-4 py-2 font-semibold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300" @click="refreshContactRequests()">
              Réessayer
            </button>
          </div>
          <div v-else-if="!contactRequests.length" class="mt-6 rounded-2xl border border-dashed border-white/20 p-6 text-sm text-brand-100/70">
            Aucune demande particulière pour le moment. Les messages envoyés depuis ton bouton WhatsApp apparaîtront ici.
          </div>
          <div v-else class="mt-6 space-y-4">
            <article
              v-for="request in contactRequests"
              :key="request.id"
              class="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="font-semibold">
                    {{ contactRequestName(request) }}
                  </p>
                  <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-200/80">
                    <span v-if="contactRequestPhone(request)">{{ contactRequestPhone(request) }}</span>
                  </div>
                </div>
                <div class="text-sm text-brand-100/80 sm:text-right">
                  <p>{{ formatDateTime(request.createdAt) }}</p>
                  <p class="mt-1 text-xs uppercase tracking-[0.2em] text-secondaryBrand-200/80">
                    {{ contactRequestStatusLabel(request.messageStatus) }}
                  </p>
                </div>
              </div>
              <p class="mt-4 whitespace-pre-line text-sm text-brand-100/85">
                {{ request.message }}
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

