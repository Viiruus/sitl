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

  // Liste des départements (même que dans l’onboarding)
  const departments = [
  '01 - Ain',
  '02 - Aisne',
  '03 - Allier',
  '04 - Alpes-de-Haute-Provence',
  '05 - Hautes-Alpes',
  '06 - Alpes-Maritimes',
  '07 - Ardèche',
  '08 - Ardennes',
  '09 - Ariège',
  '10 - Aube',
  '11 - Aude',
  '12 - Aveyron',
  '13 - Bouches-du-Rhône',
  '14 - Calvados',
  '15 - Cantal',
  '16 - Charente',
  '17 - Charente-Maritime',
  '18 - Cher',
  '19 - Corrèze',
  '21 - Côte-d’Or',
  '22 - Côtes-d’Armor',
  '23 - Creuse',
  '24 - Dordogne',
  '25 - Doubs',
  '26 - Drôme',
  '27 - Eure',
  '28 - Eure-et-Loir',
  '29 - Finistère',
  '2A - Corse-du-Sud',
  '2B - Haute-Corse',
  '30 - Gard',
  '31 - Haute-Garonne',
  '32 - Gers',
  '33 - Gironde',
  '34 - Hérault',
  '35 - Ille-et-Vilaine',
  '36 - Indre',
  '37 - Indre-et-Loire',
  '38 - Isère',
  '39 - Jura',
  '40 - Landes',
  '41 - Loir-et-Cher',
  '42 - Loire',
  '43 - Haute-Loire',
  '44 - Loire-Atlantique',
  '45 - Loiret',
  '46 - Lot',
  '47 - Lot-et-Garonne',
  '48 - Lozère',
  '49 - Maine-et-Loire',
  '50 - Manche',
  '51 - Marne',
  '52 - Haute-Marne',
  '53 - Mayenne',
  '54 - Meurthe-et-Moselle',
  '55 - Meuse',
  '56 - Morbihan',
  '57 - Moselle',
  '58 - Nièvre',
  '59 - Nord',
  '60 - Oise',
  '61 - Orne',
  '62 - Pas-de-Calais',
  '63 - Puy-de-Dôme',
  '64 - Pyrénées-Atlantiques',
  '65 - Hautes-Pyrénées',
  '66 - Pyrénées-Orientales',
  '67 - Bas-Rhin',
  '68 - Haut-Rhin',
  '69 - Rhône',
  '70 - Haute-Saône',
  '71 - Saône-et-Loire',
  '72 - Sarthe',
  '73 - Savoie',
  '74 - Haute-Savoie',
  '75 - Paris',
  '76 - Seine-Maritime',
  '77 - Seine-et-Marne',
  '78 - Yvelines',
  '79 - Deux-Sèvres',
  '80 - Somme',
  '81 - Tarn',
  '82 - Tarn-et-Garonne',
  '83 - Var',
  '84 - Vaucluse',
  '85 - Vendée',
  '86 - Vienne',
  '87 - Haute-Vienne',
  '88 - Vosges',
  '89 - Yonne',
  '90 - Territoire de Belfort',
  '91 - Essonne',
  '92 - Hauts-de-Seine',
  '93 - Seine-Saint-Denis',
  '94 - Val-de-Marne',
  '95 - Val-d’Oise',
  '971 - Guadeloupe',
  '972 - Martinique',
  '973 - Guyane',
  '974 - La Réunion',
  '976 - Mayotte',
  ]

  // Formulaire (version simplifiée du formulaire d’onboarding)
  const form = reactive({
  email: user.value?.email || '',
  firstName: '',
  lastName: '',
  birthDate: '', // on laisse en string
  department: '',

  typesOfClimbing: [] as string[],
  climbsMainly: '' as '' | 'lead' | 'toprope',
  environments: [] as string[],
  autonomy: [] as string[],
  frequency: '' as '' | 'moins_1' | '1' | '2_3' | 'plus_3',
  gradeLevel: '' as '' | 'sub_5a' | '5a_5c' | '6a_6c' | '7_plus' | 'dont_know',
  tripStyles: [] as string[],
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

      form.email = u.email || user.value?.email || ''
      if (!form.email) {
        throw new Error('Adresse email manquante pour ce profil.')
      }
      form.firstName = u.firstName || ''
      form.lastName = u.lastName || ''
      form.birthDate = u.birthDate || ''
      form.department = u.department || ''

      form.typesOfClimbing = Array.isArray(u.typesOfClimbing) ? u.typesOfClimbing : []
      form.climbsMainly = u.climbsMainly || ''
      form.environments = Array.isArray(u.environments) ? u.environments : []
      form.autonomy = Array.isArray(u.autonomy) ? u.autonomy : []
      form.frequency = u.frequency || ''
      form.gradeLevel = u.gradeLevel || ''
      form.tripStyles = Array.isArray(u.tripStyles) ? u.tripStyles : []

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

  const bookingStatusLabel = (value?: string | null) => {
    if (value === 'CONFIRMEE') return 'Confirmée'
    if (value === 'ANNULEE') return 'Annulée'
    return 'En attente'
  }

  const bookingAdventureLink = (booking: any) => {
    const slug = booking?.session?.aventure?.slug
    return slug ? `/aventures-escalade/${slug}` : '/aventures-escalade'
  }

  const bookingLocationLabel = (booking: any) => {
    return booking?.session?.aventure?.lieuLabel || 'Lieu à confirmer'
  }

  const bookingGuideName = (booking: any) => {
    const guide = booking?.session?.aventure?.guide
    return [guide?.firstName, guide?.lastName].filter(Boolean).join(' ') || 'Moniteur local'
  }

  const bookingGuideProfileUrl = (booking: any) => {
    const guide = booking?.session?.aventure?.guide
    return (
      guide?.profile?.websiteUrl ||
      guide?.profile?.instagramUrl ||
      '/la-brigade'
    )
  }

  const hasBookings = computed(() => userBookings.value.length > 0)

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
              <NuxtLink
                to="/aventures-escalade"
                class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500/90 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-brand-950 hover:bg-secondaryBrand-400"
              >
                Voir les aventures
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
                </svg>
              </NuxtLink>
            </div>

            <p v-if="!hasBookings" class="rounded-2xl border border-dashed border-brand-700/80 bg-brand-950/40 px-5 py-6 text-sm text-brand-100/70">
              Tu ne t’es pas encore positionné·e sur une date. Explore les aventures pour manifester ton intérêt 💛
            </p>

            <div v-else class="space-y-4">
              <NuxtLink
                v-for="booking in userBookings"
                :key="booking.id"
                :to="bookingAdventureLink(booking)"
                class="block rounded-2xl border border-brand-800 bg-brand-950/60 p-4 transition hover:border-secondaryBrand-400/50"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-base font-semibold text-white">
                      {{ booking.session?.aventure?.titre || 'Aventure' }}
                    </p>
                  </div>
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                    :class="booking.statut === 'CONFIRMEE'
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : booking.statut === 'ANNULEE'
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-amber-500/20 text-amber-200'"
                  >
                    {{ bookingStatusLabel(booking.statut) }}
                  </span>
                </div>

                <div class="mt-3 flex flex-wrap gap-4 text-xs text-brand-200/80">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-3.5 w-3.5 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                    </svg>
                    {{ formatSessionRange(booking.session) }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-3.5 w-3.5 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                      <circle cx="12" cy="11" r="2.2" />
                    </svg>
                    {{ bookingLocationLabel(booking) }}
                  </span>
                </div>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-200/80">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-3.5 w-3.5 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 19a6 6 0 0 1 12 0v1H6v-1Z" />
                    </svg>
                    Moniteur :
                    <a
                      :href="bookingGuideProfileUrl(booking)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="font-semibold text-secondaryBrand-200 hover:text-secondaryBrand-100"
                      @click.stop
                    >
                      {{ bookingGuideName(booking) }}
                    </a>
                  </span>
                  <span class="text-brand-200/60">
                    Demandé le {{ new Date(booking.createdAt).toLocaleDateString('fr-FR') }}
                  </span>
                </div>
              </NuxtLink>
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
                  <div class="md:col-span-2">
                    <label class="block text-sm mb-1 text-brand-100/90">Email</label>
                    <input
                      v-model="form.email"
                      type="email"
                      required
                      disabled
                      class="w-full border border-brand-800 rounded-lg px-3 py-2 bg-brand-900 text-brand-300 cursor-not-allowed"
                    />
                  </div>
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

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm mb-1 text-brand-100/90">Date de naissance</label>
                    <input
                      v-model="form.birthDate"
                      type="date"
                      class="w-full border border-brand-800 rounded-lg px-3 py-2 bg-brand-950/40 text-white focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm mb-1 text-brand-100/90">Département</label>
                    <select
                      v-model="form.department"
                      class="w-full border border-brand-800 rounded-lg px-3 py-2 bg-brand-950/40 text-white focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                    >
                      <option value="" class="bg-brand-900 text-white">Sélectionne ton département</option>
                      <option
                        v-for="d in departments"
                        :key="d"
                        :value="d"
                        class="bg-brand-900 text-white"
                      >
                        {{ d }}
                      </option>
                    </select>
                  </div>
                </div>
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

              <section class="space-y-3 border-t border-brand-800 pt-4">
                <h3 class="text-lg font-semibold text-secondaryBrand-300">
                  Vision du stage
                </h3>

                <div class="space-y-2">
                  <p class="text-sm font-medium text-brand-100/90">
                    Pour toi, quel serait la forme typique d'un stage d'escalade ?
                  </p>
                  <div class="flex flex-col gap-1 text-sm">
                    <label class="inline-flex items-start gap-2">
                      <input
                        type="checkbox"
                        :checked="form.tripStyles.includes('aventure')"
                        @change="toggleInArray(form.tripStyles, 'aventure')"
                      />
                      <span class="text-brand-100/90">Une aventure (vélo, tente, débrouille)</span>
                    </label>
                    <label class="inline-flex items-start gap-2">
                      <input
                        type="checkbox"
                        :checked="form.tripStyles.includes('confort')"
                        @change="toggleInArray(form.tripStyles, 'confort')"
                      />
                      <span class="text-brand-100/90">Tout confort (hébergement, restauration, focus escalade)</span>
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
  </div>
</template>
