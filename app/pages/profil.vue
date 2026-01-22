<script setup lang="ts">
  const { loggedIn, fetch, user, clear } = useUserSession()
  const router = useRouter()

  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)
  const profileLoaded = ref(false)
  const userBookings = ref<any[]>([])
  const activePanel = ref<'bookings' | 'profil'>('bookings')

  // Formulaire (version simplifiée du formulaire d’onboarding)
  const form = reactive({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  whatsappOptIn: false,

  typesOfClimbing: [] as string[],
  climbsMainly: '' as '' | 'lead' | 'toprope',
  environments: [] as string[],
  autonomy: [] as string[],
  frequency: '' as '' | 'moins_1' | '1' | '2_3' | 'plus_3',
  gradeLevel: '' as '' | 'sub_5a' | '5a_5c' | '6a_6c' | '7_plus' | 'dont_know',
  })

  // helpers
  const toggleInArray = (arr: string[], value: string) => {
  const idx = arr.indexOf(value)
  if (idx === -1) arr.push(value)
  else arr.splice(idx, 1)
  }

  // Charger le profil depuis /api/me
  const loadProfile = async () => {
  loading.value = true
  error.value = null
  try {
      await fetch()
      if (!loggedIn.value) {
      return router.push('/login')
      }

      const res = await $fetch<{ user: any }>('/api/me')
      const u = res.user

      form.firstName = u.firstName || ''
      form.lastName = u.lastName || ''
      form.phoneNumber = u.phoneNumber || ''
      form.whatsappOptIn = Boolean(u.whatsappOptIn)

      form.typesOfClimbing = Array.isArray(u.typesOfClimbing) ? u.typesOfClimbing : []
      form.climbsMainly = u.climbsMainly || ''
      form.environments = Array.isArray(u.environments) ? u.environments : []
      form.autonomy = Array.isArray(u.autonomy) ? u.autonomy : []
      form.frequency = u.frequency || ''
      form.gradeLevel = u.gradeLevel || ''

      userBookings.value = Array.isArray(u.bookings) ? u.bookings : []
      profileLoaded.value = true
  } catch (e: any) {
      console.error(e)
      error.value = e?.data?.message || "Impossible de charger ton profil."
  } finally {
      loading.value = false
  }
  }

  onMounted(loadProfile)

  // Enregistrer = réutiliser /api/onboarding
  const save = async () => {
  error.value = null
  success.value = null
  saving.value = true

  try {
      await $fetch('/api/onboarding', {
      method: 'POST',
      body: { ...form },
      })
      success.value = 'Profil mis à jour ✅'
  } catch (e: any) {
      console.error(e)
      error.value = e?.data?.message || "Erreur lors de l’enregistrement."
  } finally {
      saving.value = false
  }
  }

  // champs conditionnels
  const needsRopeFields = computed(
  () =>
      form.typesOfClimbing.includes('sport') ||
      form.typesOfClimbing.includes('multi'),
  )

  const formatSessionRange = (session: any) => {
    if (!session) return ''
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
    })
    const start = formatter.format(new Date(session.dateDebut))
    const end = formatter.format(new Date(session.dateFin))
    return start === end ? start : `${start} → ${end}`
  }

  const bookingStatusLabel = (booking: any) => {
    if (booking?.statut === 'ANNULEE') return 'Annulée'
    if (booking?.statut === 'CONFIRMEE') return 'Confirmée'
    return 'En attente'
  }

  const bookingStatusToneClass = (booking: any) => {
    if (booking?.statut === 'ANNULEE') return 'bg-red-500/20 text-red-200'
    if (booking?.statut === 'CONFIRMEE') return 'bg-emerald-500/20 text-emerald-200'
    return 'bg-amber-500/20 text-amber-200'
  }

  const bookingAdventureLink = (booking: any) => {
    const slug = booking?.session?.aventure?.slug
    return slug ? `/aventures-escalade/${slug}` : '/aventures-escalade'
  }

  const bookingLocationLabel = (booking: any) => {
    return booking?.session?.aventure?.lieuLabel || 'Lieu à confirmer'
  }

  const showCancelModal = ref(false)
  const bookingPendingCancel = ref<any | null>(null)
  const cancelling = ref(false)

  const openCancelModal = (booking: any) => {
    bookingPendingCancel.value = booking
    showCancelModal.value = true
  }

  const closeCancelModal = () => {
    if (cancelling.value) return
    showCancelModal.value = false
    bookingPendingCancel.value = null
  }

  const confirmCancel = async () => {
    const booking = bookingPendingCancel.value
    if (!booking?.id) return
    cancelling.value = true
    error.value = null
    success.value = null
    try {
      await $fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      })
      userBookings.value = userBookings.value.filter((b: any) => b.id !== booking.id)
      success.value = 'Pré-inscription annulée.'
    } catch (e: any) {
      console.error(e)
      error.value = e?.data?.message || 'Impossible d’annuler cette session.'
    } finally {
      cancelling.value = false
      showCancelModal.value = false
      bookingPendingCancel.value = null
    }
  }

  const bookingGuideName = (booking: any) => {
    const guide = booking?.session?.aventure?.guide
    return [guide?.firstName, guide?.lastName].filter(Boolean).join(' ') || 'Moniteur local'
  }

  const slugifyName = (firstName?: string | null, lastName?: string | null, fallback?: string | number | null) => {
    const base = [firstName, lastName].filter(Boolean).join(' ').trim()
    if (!base) return fallback ? String(fallback) : ''
    return base
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
  }

  const bookingGuideProfileUrl = (booking: any) => {
    const aventure = booking?.session?.aventure
    const guide = aventure?.guide
    const slug = slugifyName(guide?.firstName, guide?.lastName, guide?.id)
    return slug ? `/moniteurs/${slug}` : '/la-brigade'
  }

  const shareAdventure = async (booking: any) => {
    const path = bookingAdventureLink(booking)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = origin ? `${origin}${path}` : path
    error.value = null
    success.value = null
    shareMessage.value = ''
    shareError.value = ''

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        shareMessage.value = 'Lien copié dans le presse-papiers ✅'
        setTimeout(() => {
          shareMessage.value = ''
        }, 3000)
        return url
      } catch (e) {
        shareError.value = 'Impossible de copier le lien'
        setTimeout(() => {
          shareError.value = ''
        }, 3000)
        return
      }
    }
    // Fallback: best-effort prompt copy
    try {
      window.prompt('Copie ce lien', url)
      shareMessage.value = 'Lien affiché pour copie'
      setTimeout(() => {
        shareMessage.value = ''
      }, 3000)
    } catch (e) {
      shareError.value = 'Partage indisponible sur ce navigateur'
      setTimeout(() => {
        shareError.value = ''
      }, 3000)
    }
  }

  const bookingPlacesInfo = (booking: any) => {
    const session = booking?.session
    if (!session) return null
    const reserved = session.placesReservees ?? 0
    const minNeeded = session.aventure?.placesMin ?? 0
    if (!minNeeded) return null
    const remaining = Math.max(0, minNeeded - reserved)
    return { remaining, minNeeded }
  }

  const hasBookings = computed(() => userBookings.value.length > 0)
  const shareMessage = ref('')
  const shareError = ref('')

  const logout = async () => {
    await clear()
    await fetch()
    await router.push('/')
  }
</script>


<template>
  <div class="min-h-screen bg-brand-950 py-10 px-4">
    <div class="mx-auto max-w-6xl lg:flex lg:items-start lg:gap-8">
      <aside class="mb-8 w-full lg:mb-0 lg:w-64">
        <div class="space-y-6 rounded-3xl border border-brand-800 bg-brand-900/70 p-6 shadow-2xl shadow-black/40 lg:sticky lg:top-10">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200/70">
              Mon compte
            </p>
            <NuxtLink
              to="/aventures-escalade"
              class="inline-flex items-center gap-2 rounded-full border border-brand-700 px-3 py-2 text-sm text-white hover:bg-brand-800/60 transition"
            >
              ← Revenir aux aventures
            </NuxtLink>
            <p class="text-xs text-brand-200/70">
              Consulte tes demandes et ajuste ton profil grimpeur.
            </p>
          </div>

          <nav class="space-y-2 text-sm">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition"
              :class="activePanel === 'bookings'
                ? 'border-secondaryBrand-400 bg-secondaryBrand-500/20 text-white'
                : 'border-brand-700 bg-brand-950/40 text-brand-100/70 hover:border-secondaryBrand-400/50'"
              @click="activePanel = 'bookings'"
            >
              <span>Mes demandes</span>
              <span
                v-if="userBookings.length"
                class="rounded-full bg-brand-900 px-2 py-0.5 text-[11px] font-semibold text-secondaryBrand-200"
              >
                {{ userBookings.length }}
              </span>
            </button>
            <button
              type="button"
              class="flex w-full items-center rounded-2xl border px-3 py-2 text-left transition"
              :class="activePanel === 'profil'
                ? 'border-secondaryBrand-400 bg-secondaryBrand-500/20 text-white'
                : 'border-brand-700 bg-brand-950/40 text-brand-100/70 hover:border-secondaryBrand-400/50'"
              @click="activePanel = 'profil'"
            >
              Profil & préférences
            </button>
          </nav>
        </div>
      </aside>

      <main class="flex-1 space-y-6">
        <div
          v-if="loading"
          class="rounded-3xl border border-brand-800 bg-brand-900/70 p-6 text-sm text-brand-100/80 shadow-2xl shadow-black/40"
        >
          Chargement de ton compte...
        </div>

        <template v-else>
          <section
            v-if="activePanel === 'bookings'"
            class="space-y-6 rounded-3xl border border-brand-800 bg-brand-900/70 p-6 shadow-2xl shadow-black/40"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-brand-200/80">
                  Mes demandes
                </p>
                <h1 class="text-2xl font-semibold text-secondaryBrand-200">
                  Pré-inscriptions & dates envisagées
                </h1>
                <p class="text-sm text-brand-100/80">
                  Les moniteurs te contacteront directement pour constituer les groupes.
                </p>
              </div>
            </div>

            <div v-if="shareMessage || shareError" class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <p v-if="shareMessage" class="text-emerald-200">{{ shareMessage }}</p>
              <p v-else-if="shareError" class="text-red-200">{{ shareError }}</p>
            </div>

            <p v-if="!hasBookings" class="rounded-2xl border border-dashed border-brand-700/80 bg-brand-950/40 px-5 py-6 text-sm text-brand-100/70">
              Tu ne t’es pas encore positionné·e sur une date. Explore les aventures pour manifester ton intérêt 💛
            </p>

          <div v-else class="space-y-4">
            <div
              v-for="booking in userBookings"
              :key="booking.id"
              class="rounded-2xl border border-brand-800 bg-brand-950/70 p-5"
            >
              <div class="grid gap-4 md:grid-cols-[7fr_4fr]">
                <!-- Bloc infos session -->
                <div class="md:col-span-2 rounded-xl flex flex-col gap-3 h-full">
                  <div class="flex items-start justify-between gap-3">
                    <p class="text-lg font-semibold text-white">
                      {{ booking.session?.aventure?.titre || 'Aventure' }}
                    </p>
                  </div>

                  <div class="grid gap-3 text-sm text-brand-100/85 sm:grid-cols-2 flex-1">
                    <div class="flex items-start gap-2">
                      <svg class="mt-0.5 h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                      </svg>
                      <div>
                        <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">Dates</p>
                        <p class="font-medium text-white/90">{{ formatSessionRange(booking.session) }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-2">
                      <svg class="mt-0.5 h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                        <circle cx="12" cy="11" r="2.2" />
                      </svg>
                      <div>
                        <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">Lieu</p>
                        <p class="font-medium text-white/90">{{ bookingLocationLabel(booking) }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-2">
                      <svg class="mt-0.5 h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 14c1.657 0 3 1.343 3 3v1h-6v-1c0-1.657 1.343-3 3-3Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 14c1.657 0 3 1.343 3 3v1H5v-1c0-1.657 1.343-3 3-3Z" />
                        <circle cx="16" cy="10" r="2.5" />
                        <circle cx="8" cy="10" r="2.5" />
                      </svg>
                      <div>
                        <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">Participants</p>
                        <p class="font-medium text-white/90">{{ booking.participants || 1 }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-2">
                      <svg class="mt-0.5 h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 19a6 6 0 0 1 12 0v1H6v-1Z" />
                      </svg>
                      <div>
                        <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">Moniteur</p>
                        <a
                          :href="bookingGuideProfileUrl(booking)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="font-semibold text-secondaryBrand-200 hover:text-secondaryBrand-100"
                          @click.stop
                        >
                          {{ bookingGuideName(booking) }}
                        </a>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Bloc réservation -->
                <div class="rounded-xl border border-brand-800/70 bg-brand-950/50 p-5 flex flex-col gap-4 md:col-span-1 md:col-start-3 md:w-full md:max-w-[360px] min-w-[280px]">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs uppercase tracking-[0.25em] text-brand-200/70">Réservation</p>
                    <span
                      class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                      :class="bookingStatusToneClass(booking)"
                    >
                      {{ bookingStatusLabel(booking) }}
                    </span>
                  </div>

                    <div class="text-sm text-brand-100/85 space-y-1">
                      <p>Demandé le <span class="font-semibold text-white">{{ new Date(booking.createdAt).toLocaleDateString('fr-FR') }}</span></p>
                    </div>

                  <div class="mt-auto flex items-center gap-2">
                    <NuxtLink
                      :to="bookingAdventureLink(booking)"
                      class="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-secondaryBrand-200 transition hover:border-secondaryBrand-300 hover:bg-secondaryBrand-500/15"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l7 7-7 7" />
                      </svg>
                      <span class="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg shadow-black/40 transition group-hover:opacity-100">
                        Voir l'aventure
                      </span>
                    </NuxtLink>

                    <button
                      type="button"
                      class="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-secondaryBrand-200 transition hover:border-secondaryBrand-300 hover:bg-secondaryBrand-500/15"
                      @click.stop.prevent="shareAdventure(booking)"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <circle cx="18" cy="5.5" r="2.3" />
                        <circle cx="6" cy="12" r="2.3" />
                        <circle cx="18" cy="18.5" r="2.3" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.8 10.9 16.2 6.6M7.8 13.1l8.4 4.3" />
                      </svg>
                      <span class="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg shadow-black/40 transition group-hover:opacity-100">
                        Partager l'aventure
                      </span>
                    </button>

                    <button
                      v-if="booking.statut !== 'ANNULEE'"
                      type="button"
                      class="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-red-200 transition hover:border-red-300 hover:bg-red-500/15"
                      @click.stop.prevent="openCancelModal(booking)"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
                      </svg>
                      <span class="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg shadow-black/40 transition group-hover:opacity-100">
                        Annuler la pré-inscription
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  v-if="bookingPlacesInfo(booking) && bookingPlacesInfo(booking)?.remaining > 0"
                  class="md:col-span-3 rounded-xl border border-amber-400/30 bg-amber-500/8 px-3 py-3 space-y-3 text-xs text-amber-50/90"
                >
                  <div class="flex items-start gap-2">
                    <svg class="mt-0.5 h-4 w-4 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4l2.5 2.5m5.5-3.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p>
                      Il manque {{ bookingPlacesInfo(booking)?.remaining }} grimpeur<span v-if="bookingPlacesInfo(booking)?.remaining > 1">s</span> pour que le départ soit confirmé.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center gap-2 rounded-full border border-secondaryBrand-300/60 bg-secondaryBrand-400/15 px-4 py-2 text-[12px] font-semibold text-secondaryBrand-100 hover:bg-secondaryBrand-400/25 transition"
                    @click.stop.prevent="shareAdventure(booking)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                      <circle cx="18" cy="5.5" r="2.3" />
                      <circle cx="6" cy="12" r="2.3" />
                      <circle cx="18" cy="18.5" r="2.3" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7.8 10.9 16.2 6.6M7.8 13.1l8.4 4.3" />
                    </svg>
                    Partager cette aventure
                  </button>
                </div>
              </div>
            </div>
          </div>
          </section>

          <section
            v-else
            class="space-y-6 rounded-3xl border border-brand-800 bg-brand-900/70 p-6 shadow-2xl shadow-black/40"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-brand-200/80">
                  Profil
                </p>
                <h2 class="text-2xl font-semibold text-secondaryBrand-200">
                  Préférences & infos grimpeur
                </h2>
                <p class="text-sm text-brand-100/75">
                  Ces éléments nous aident à te proposer les bonnes aventures.
                </p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 ring-1 ring-red-500/40 transition hover:bg-red-500/20"
                @click="logout"
              >
                <svg
                  class="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4-4-4m-5 4h9M7 5h5a2 2 0 0 1 2 2v3" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 19h5a2 2 0 0 0 2-2v-3M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2" />
                </svg>
                Déconnexion
              </button>
            </div>

            <p v-if="error" class="text-sm text-red-400">
              {{ error }}
            </p>
            <p v-if="success" class="text-sm text-emerald-400">
              {{ success }}
            </p>

            <form
              v-if="profileLoaded"
              class="space-y-6"
              @submit.prevent="save"
            >
              <section class="space-y-3">
                <h3 class="text-lg font-semibold text-secondaryBrand-300">
                  Informations personnelles
                </h3>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm mb-1 text-brand-100/90">Prénom</label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      class="w-full border border-brand-800 rounded-lg px-3 py-2 bg-brand-950/40 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm mb-1 text-brand-100/90">Nom</label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      class="w-full border border-brand-800 rounded-lg px-3 py-2 bg-brand-950/40 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm mb-1 text-brand-100/90">Téléphone (WhatsApp)</label>
                  <input
                    v-model="form.phoneNumber"
                    type="tel"
                    class="w-full border border-brand-800 rounded-lg px-3 py-2 bg-brand-950/40 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                    placeholder="+33 6 12 34 56 78"
                  />
                  <p class="mt-1 text-xs text-brand-200/70">
                    Numéro utilisé pour les échanges avec les moniteurs et la connexion WhatsApp.
                  </p>
                </div>

                <div class="grid md:grid-cols-2 gap-4"></div>
              </section>

              <section class="space-y-3 border-t border-brand-800 pt-4">
                <h3 class="text-lg font-semibold text-secondaryBrand-300">
                  Ta pratique
                </h3>

                <div class="space-y-2">
                  <p class="text-sm font-medium text-brand-100/90">
                    Quel(s) type(s) d'escalade pratiques-tu ?
                  </p>
                  <div class="flex flex-wrap gap-2 text-sm">
                    <button
                      type="button"
                      class="px-3 py-1 rounded-full border text-xs"
                      :class="form.typesOfClimbing.includes('bloc')
                        ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                        : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                      @click="toggleInArray(form.typesOfClimbing, 'bloc')"
                    >
                      Bloc
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1 rounded-full border text-xs"
                      :class="form.typesOfClimbing.includes('sport')
                        ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                        : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                      @click="toggleInArray(form.typesOfClimbing, 'sport')"
                    >
                      Escalade sportive
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1 rounded-full border text-xs"
                      :class="form.typesOfClimbing.includes('multi')
                        ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                        : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                      @click="toggleInArray(form.typesOfClimbing, 'multi')"
                    >
                      Grande voie
                    </button>
                  </div>
                </div>

                <div v-if="needsRopeFields" class="space-y-3">
                  <div>
                    <p class="text-sm font-medium text-brand-100/90">
                      Tu grimpes principalement ?
                    </p>
                    <div class="flex flex-col gap-1 text-sm">
                      <label class="inline-flex items-center gap-2">
                        <input
                          v-model="form.climbsMainly"
                          type="radio"
                          value="lead"
                        />
                        <span class="text-brand-100/90">En tête</span>
                      </label>
                      <label class="inline-flex items-center gap-2">
                        <input
                          v-model="form.climbsMainly"
                          type="radio"
                          value="toprope"
                        />
                        <span class="text-brand-100/90">En moulinette</span>
                      </label>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <p class="text-sm font-medium text-brand-100/90">
                      Tu grimpes dans quel(s) environnement(s) ?
                    </p>
                    <div class="flex flex-wrap gap-2 text-sm">
                      <button
                        type="button"
                        class="px-3 py-1 rounded-full border text-xs"
                        :class="form.environments.includes('falaise')
                          ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                          : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                        @click="toggleInArray(form.environments, 'falaise')"
                      >
                        Falaise
                      </button>
                      <button
                        type="button"
                        class="px-3 py-1 rounded-full border text-xs"
                        :class="form.environments.includes('salle_privee')
                          ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                          : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                        @click="toggleInArray(form.environments, 'salle_privee')"
                      >
                        Salle privée
                      </button>
                      <button
                        type="button"
                        class="px-3 py-1 rounded-full border text-xs"
                        :class="form.environments.includes('salle_asso')
                          ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                          : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                        @click="toggleInArray(form.environments, 'salle_asso')"
                      >
                        Salle communale (asso)
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <p class="text-sm font-medium text-brand-100/90">
                      Ton niveau d'autonomie
                    </p>
                    <div class="flex flex-col gap-1 text-sm">
                      <label class="inline-flex items-start gap-2">
                        <input
                          type="checkbox"
                          :checked="form.autonomy.includes('assur_tete')"
                          @change="toggleInArray(form.autonomy, 'assur_tete')"
                        />
                        <span class="text-brand-100/90">Assurer en tête un partenaire</span>
                      </label>
                      <label class="inline-flex items-start gap-2">
                        <input
                          type="checkbox"
                          :checked="form.autonomy.includes('manip_haut_de_voie')"
                          @change="toggleInArray(form.autonomy, 'manip_haut_de_voie')"
                        />
                        <span class="text-brand-100/90">Manip de haut de voie</span>
                      </label>
                      <label class="inline-flex items-start gap-2">
                        <input
                          type="checkbox"
                          :checked="form.autonomy.includes('relais_grande_voie')"
                          @change="toggleInArray(form.autonomy, 'relais_grande_voie')"
                        />
                        <span class="text-brand-100/90">Relais grande voie</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium text-brand-100/90">
                    À quelle fréquence grimpes-tu ?
                  </p>
                  <div class="flex flex-col gap-1 text-sm">
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.frequency"
                        type="radio"
                        value="moins_1"
                      />
                      <span class="text-brand-100/90">Moins d'une fois / semaine</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.frequency"
                        type="radio"
                        value="1"
                      />
                      <span class="text-brand-100/90">1 fois / semaine</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.frequency"
                        type="radio"
                        value="2_3"
                      />
                      <span class="text-brand-100/90">2–3 fois / semaine</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.frequency"
                        type="radio"
                        value="plus_3"
                      />
                      <span class="text-brand-100/90">Plus de 3 fois / semaine</span>
                    </label>
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium text-brand-100/90">
                    Niveau à vue
                  </p>
                  <div class="grid gap-2 text-sm sm:grid-cols-2">
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.gradeLevel"
                        type="radio"
                        value="sub_5a"
                      />
                      <span class="text-brand-100/90">En dessous de 5a</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.gradeLevel"
                        type="radio"
                        value="5a_5c"
                      />
                      <span class="text-brand-100/90">Entre 5a et 5c</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.gradeLevel"
                        type="radio"
                        value="6a_6c"
                      />
                      <span class="text-brand-100/90">Entre 6a et 6c</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.gradeLevel"
                        type="radio"
                        value="7_plus"
                      />
                      <span class="text-brand-100/90">Dans le 7ème degré et au-dessus</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="form.gradeLevel"
                        type="radio"
                        value="dont_know"
                      />
                      <span class="text-brand-100/90">Je ne sais pas / surtout du bloc en salle</span>
                    </label>
                  </div>
                </div>
              </section>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg bg-secondaryBrand-500 text-brand-950 text-sm font-medium disabled:opacity-60 hover:bg-secondaryBrand-400 transition"
                  :disabled="saving"
                >
                  <span v-if="saving">Enregistrement...</span>
                  <span v-else>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </section>
        </template>
      </main>
    </div>

    <!-- Modal d'annulation -->
    <transition name="fade">
      <div
        v-if="showCancelModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div class="max-w-lg w-full rounded-2xl border border-brand-700 bg-brand-900/90 p-6 shadow-2xl shadow-black/50">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-3">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-200/80">
                Confirmation
              </p>
              <h3 class="text-xl font-semibold text-white">
                Annuler cette pré-inscription ?
              </h3>
              <p class="text-sm text-brand-100/80 leading-relaxed">
                Tu es à un clic d'annuler ton aventure d'escalade, es-tu sûr de ça ? Si oui, fais toi remplacer par un(e) ami(e) en partageant cette aventure !
              </p>
            </div>
            <button
              type="button"
              class="text-brand-200 hover:text-white transition"
              @click="closeCancelModal"
              aria-label="Fermer"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-brand-100 hover:bg-brand-800/70 border border-brand-700"
              @click="closeCancelModal"
              :disabled="cancelling"
            >
              Revenir
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-brand-950 bg-red-400 hover:bg-red-300 disabled:opacity-60"
              @click="confirmCancel"
              :disabled="cancelling"
            >
              <span v-if="cancelling">Annulation...</span>
              <span v-else>Confirmer l'annulation</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
:deep(input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
