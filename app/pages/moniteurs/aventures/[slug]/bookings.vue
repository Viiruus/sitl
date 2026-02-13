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
                <span class="text-sm text-brand-200/80">
                  {{ group.bookings.length }} réservation{{ group.bookings.length > 1 ? 's' : '' }}
                </span>
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
