<script setup lang="ts">
const { loggedIn, fetch } = useUserSession()
const router = useRouter()

// Étapes
const step = ref(1)
const maxStep = 2

// Formulaire
const form = reactive({
  // Informations personnelles
  firstName: '',
  lastName: '',
  cguAccepted: false,

  // Pratique
  typesOfClimbing: [] as string[], // ['bloc', 'sport', 'multi', 'trad']
  climbsMainly: '' as '' | 'lead' | 'toprope',
  environments: [] as string[], // ['exterieur','salle_privee','salle_asso']
  autonomy: [] as string[], // valeurs prédéfinies
  belayDevices: [] as string[],
  multiAutonomy: [] as string[],
  tradProtections: [] as string[],
  tradMovingBelay: '' as '' | 'oui' | 'non',
  frequency: '' as
    | ''
    | 'moins_1'
    | '1'
    | '2_3'
    | 'plus_3',

  // Niveau
  gradeLevel: '' as
    | ''
    | 'sub_5a'
    | '5a_5c'
    | '6a_6c'
    | '7_plus'
    | 'dont_know',

  // Vision du voyage
  tripStyles: [] as string[], // ['aventure','confort']
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Champs conditionnels : si corde (sport ou grande voie) cochés
const needsRopeFields = computed(() =>
  form.typesOfClimbing.includes('sport') ||
  form.typesOfClimbing.includes('multi') ||
  form.typesOfClimbing.includes('trad')
)

// Guard d’auth : on vérifie que l’utilisateur est connecté
onMounted(async () => {
  await fetch()
  if (!loggedIn.value) {
    router.push('/login')
  }
})

// Helpers pour les cases à cocher
const toggleInArray = (arr: string[], value: string) => {
  const idx = arr.indexOf(value)
  if (idx === -1) arr.push(value)
  else arr.splice(idx, 1)
}

const nextStep = () => {
  if (step.value < maxStep) step.value++
}

const prevStep = () => {
  if (step.value > 1) step.value--
}

const canGoNext = computed(() => {
  if (step.value === 1) {
    return Boolean(form.firstName.trim()) && Boolean(form.lastName.trim()) && form.cguAccepted
  }
  return true
})

const submit = async () => {
  error.value = null
  success.value = null
  loading.value = true

  try {
    await $fetch('/api/onboarding', {
      method: 'POST',
      body: { ...form },
    })

    success.value = 'Profil enregistré ✅'
    router.push('/profil')
  } catch (e: any) {
    error.value = e?.data?.message || 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 py-10 px-4">
    <div
      class="max-w-6xl mx-auto rounded-3xl border border-brand-800 bg-brand-900/80 shadow-xl backdrop-blur-sm grid md:grid-cols-[260px,1fr]"
    >
      <!-- Colonne gauche : stepper / contexte -->
      <aside class="border-b md:border-b-0 md:border-r border-brand-800 p-6 flex flex-col gap-6">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-800/80 px-3 py-1 text-[11px] font-medium">
            <span class="h-2 w-2 rounded-full bg-secondaryBrand-400" />
            <span class="text-brand-100/80">Onboarding grimpeur</span>
          </div>

          <div class="space-y-1">
            <h1 class="text-xl font-semibold text-secondaryBrand-300">
              Faisons connaissance 👋
            </h1>
            <p class="text-xs text-brand-100/70">
              Quelques questions pour te proposer des séjours et stages qui collent à ta pratique.
            </p>
          </div>
        </div>

        <!-- Stepper vertical -->
        <div class="space-y-4">
          <div class="space-y-1 text-[11px] text-brand-200/70">
            <p>Progression</p>
            <div class="w-full bg-brand-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                class="bg-secondaryBrand-500 h-1.5 rounded-full transition-all"
                :style="{ width: (step / maxStep) * 100 + '%' }"
              />
            </div>
            <p class="text-[11px] text-brand-200/60 mt-1">
              Étape {{ step }} sur {{ maxStep }}
            </p>
          </div>

          <ol class="space-y-2 text-xs">
            <li
              v-for="s in [
                { n: 1, label: 'Profil' },
                { n: 2, label: 'Pratique' },
              ]"
              :key="s.n"
              class="flex items-center gap-3"
            >
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full border text-[11px]"
                :class="s.n === step
                  ? 'border-secondaryBrand-500 bg-secondaryBrand-500 text-brand-950'
                  : s.n < step
                    ? 'border-secondaryBrand-500 bg-secondaryBrand-500/10 text-secondaryBrand-200'
                    : 'border-brand-700 bg-brand-900 text-brand-300/70'"
              >
                {{ s.n }}
              </div>
              <span
                :class="s.n === step
                  ? 'text-brand-50'
                  : 'text-brand-200/70'"
              >
                {{ s.label }}
              </span>
            </li>
          </ol>
        </div>

        <p class="mt-auto text-[11px] text-brand-200/60">
          Tu pourras modifier ces infos plus tard dans “Mon profil”.
        </p>
      </aside>

      <!-- Colonne droite : contenu d’étape -->
      <main class="p-6 md:p-8 space-y-6">
        <!-- ÉTAPE 1 -->
        <section
          v-if="step === 1"
          class="space-y-6"
        >
          <header class="space-y-1">
            <h2 class="text-lg font-semibold text-secondaryBrand-300">
              Informations personnelles
            </h2>
            <p class="text-xs text-brand-200/80">
              Juste l’essentiel pour personnaliser ton espace.
            </p>
          </header>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-brand-100/90">Prénom</label>
              <input
                v-model="form.firstName"
                type="text"
                class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-medium text-brand-100/90">Nom</label>
              <input
                v-model="form.lastName"
                type="text"
                class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
              />
            </div>
          </div>

          <div class="space-y-3">
            <div class="max-h-32 overflow-y-auto rounded-2xl border border-brand-800 bg-brand-950/50 p-4 text-[11px] leading-relaxed text-brand-100/80">
              <p class="font-semibold text-secondaryBrand-200">Conditions générales d’utilisation</p>
              <p class="mt-2">
                En utilisant la plateforme, tu acceptes de fournir des informations exactes et à jour.
                Tu es responsable des messages et contenus partagés avec les moniteurs et les autres
                participants. Les réservations et paiements se font directement avec le moniteur :
                Brigade du kiff n’est pas partie au contrat d’encadrement.
              </p>
              <p class="mt-2">
                Les données personnelles sont utilisées pour gérer ton compte, tes préférences et tes
                inscriptions. Tu peux demander leur suppression ou modification. En poursuivant, tu confirmes
                avoir lu et accepté ces conditions.
              </p>
            </div>
            <div class="flex items-start gap-3 rounded-2xl border border-brand-800 bg-brand-950/50 p-4">
              <input
                id="cgu"
                v-model="form.cguAccepted"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-brand-700 text-secondaryBrand-500 focus:ring-secondaryBrand-500"
              />
              <label for="cgu" class="text-sm text-brand-100/85">
                J’ai lu et j’accepte les CGU.
              </label>
            </div>
          </div>
        </section>

        <!-- ÉTAPE 2 -->
        <section
          v-else-if="step === 2"
          class="space-y-6"
        >
          <header class="space-y-1">
            <h2 class="text-lg font-semibold text-secondaryBrand-300">
              Ta pratique de l’escalade
            </h2>
            <p class="text-xs text-brand-200/80">
              Comment tu grimpes en ce moment, et dans quels environnements.
            </p>
          </header>

          <div class="space-y-3">
            <p class="text-sm font-medium text-brand-100/90">
              Quel(s) type(s) d'escalade pratiques-tu ?
            </p>
            <div class="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                class="px-3 py-1.5 rounded-full border text-xs"
                :class="form.typesOfClimbing.includes('bloc')
                  ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                  : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                @click="toggleInArray(form.typesOfClimbing, 'bloc')"
              >
                Bloc
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full border text-xs"
                :class="form.typesOfClimbing.includes('sport')
                  ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                  : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                @click="toggleInArray(form.typesOfClimbing, 'sport')"
              >
                Escalade sportive (couenne)
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full border text-xs"
                :class="form.typesOfClimbing.includes('multi')
                  ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                  : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                @click="toggleInArray(form.typesOfClimbing, 'multi')"
              >
                Grande voie
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full border text-xs"
                :class="form.typesOfClimbing.includes('trad')
                  ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                  : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                @click="toggleInArray(form.typesOfClimbing, 'trad')"
              >
                Trad
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full border text-xs"
                :class="form.typesOfClimbing.includes('via_ferrata')
                  ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                  : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                @click="toggleInArray(form.typesOfClimbing, 'via_ferrata')"
              >
                Via ferrata
              </button>
            </div>
          </div>

          <div
            v-if="needsRopeFields"
            class="space-y-4 border-t border-brand-800 pt-4"
          >
            <div
              v-if="form.typesOfClimbing.includes('sport')"
              class="space-y-3 rounded-2xl border border-brand-800/70 bg-brand-950/30 p-4"
            >
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200/80">
                Voie
              </p>
              <div class="space-y-2">
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
                    class="px-3 py-1.5 rounded-full border text-xs"
                    :class="form.environments.includes('exterieur')
                      ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                      : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                    @click="toggleInArray(form.environments, 'exterieur')"
                  >
                    En extérieur
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-full border text-xs"
                    :class="form.environments.includes('salle_privee')
                      ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                      : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                    @click="toggleInArray(form.environments, 'salle_privee')"
                  >
                    En salle privée
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-full border text-xs"
                    :class="form.environments.includes('salle_asso')
                      ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                      : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                    @click="toggleInArray(form.environments, 'salle_asso')"
                  >
                    En salle associative
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
                      :checked="form.autonomy.includes('assur_moulinette')"
                      @change="toggleInArray(form.autonomy, 'assur_moulinette')"
                    />
                    <span class="text-brand-100/90">Assurer un partenaire en moulinette</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.autonomy.includes('assur_tete')"
                      @change="toggleInArray(form.autonomy, 'assur_tete')"
                    />
                    <span class="text-brand-100/90">Assurer un partenaire en tête</span>
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
                      :checked="form.autonomy.includes('rechappe')"
                      @change="toggleInArray(form.autonomy, 'rechappe')"
                    />
                    <span class="text-brand-100/90">Réchappe</span>
                  </label>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium text-brand-100/90">
                  Tu sais assurer avec ?
                </p>
                <div class="flex flex-col gap-1 text-sm">
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.belayDevices.includes('reverso')"
                      @change="toggleInArray(form.belayDevices, 'reverso')"
                    />
                    <span class="text-brand-100/90">Un descendeur type “Reverso”</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.belayDevices.includes('grigri')"
                      @change="toggleInArray(form.belayDevices, 'grigri')"
                    />
                    <span class="text-brand-100/90">Un “Grigri”</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.belayDevices.includes('smart_jul')"
                      @change="toggleInArray(form.belayDevices, 'smart_jul')"
                    />
                    <span class="text-brand-100/90">Un descendeur autobloquant type “Smart” ou “Jul”</span>
                  </label>
                </div>
              </div>
            </div>

            <div
              v-if="form.typesOfClimbing.includes('multi')"
              class="space-y-3 rounded-2xl border border-brand-800/70 bg-brand-950/30 p-4"
            >
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200/80">
                Grande voie
              </p>
              <div class="space-y-2">
                <p class="text-sm font-medium text-brand-100/90">
                  Ton niveau d’autonomie
                </p>
                <div class="flex flex-col gap-1 text-sm">
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.multiAutonomy.includes('assur_haut_voie')"
                      @change="toggleInArray(form.multiAutonomy, 'assur_haut_voie')"
                    />
                    <span class="text-brand-100/90">Assurer depuis le haut de la voie</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.multiAutonomy.includes('rappel')"
                      @change="toggleInArray(form.multiAutonomy, 'rappel')"
                    />
                    <span class="text-brand-100/90">Descendre en rappel</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.multiAutonomy.includes('leader_cordee')"
                      @change="toggleInArray(form.multiAutonomy, 'leader_cordee')"
                    />
                    <span class="text-brand-100/90">Leader une cordée</span>
                  </label>
                </div>
              </div>
            </div>

            <div
              v-if="form.typesOfClimbing.includes('trad')"
              class="space-y-3 rounded-2xl border border-brand-800/70 bg-brand-950/30 p-4"
            >
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200/80">
                Trad
              </p>
              <div class="space-y-2">
                <p class="text-sm font-medium text-brand-100/90">
                  Quelles protections as tu déjà posé ?
                </p>
                <div class="flex flex-col gap-1 text-sm">
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.tradProtections.includes('friends')"
                      @change="toggleInArray(form.tradProtections, 'friends')"
                    />
                    <span class="text-brand-100/90">Friends</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.tradProtections.includes('cables')"
                      @change="toggleInArray(form.tradProtections, 'cables')"
                    />
                    <span class="text-brand-100/90">Câblés</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.tradProtections.includes('piton')"
                      @change="toggleInArray(form.tradProtections, 'piton')"
                    />
                    <span class="text-brand-100/90">Piton</span>
                  </label>
                  <label class="inline-flex items-start gap-2">
                    <input
                      type="checkbox"
                      :checked="form.tradProtections.includes('lunule')"
                      @change="toggleInArray(form.tradProtections, 'lunule')"
                    />
                    <span class="text-brand-100/90">Lunule</span>
                  </label>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium text-brand-100/90">
                  Connais tu les principes de l’assurage en mouvement (corde tendue) ?
                </p>
                <div class="flex flex-col gap-1 text-sm">
                  <label class="inline-flex items-center gap-2">
                    <input
                      v-model="form.tradMovingBelay"
                      type="radio"
                      value="oui"
                    />
                    <span class="text-brand-100/90">Oui</span>
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input
                      v-model="form.tradMovingBelay"
                      type="radio"
                      value="non"
                    />
                    <span class="text-brand-100/90">Non</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 border-t border-brand-800 pt-4">
            <p class="text-sm font-medium text-brand-100/90">
              Fréquence de grimpe par semaine
            </p>
            <div class="flex flex-col gap-1 text-sm">
              <label class="inline-flex items-center gap-2">
                <input
                  v-model="form.frequency"
                  type="radio"
                  value="moins_1"
                />
                <span class="text-brand-100/90">Moins d'1 fois / semaine</span>
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
        </section>

        <!-- Messages + navigation -->
        <section class="space-y-3 border-t border-brand-800 pt-4">
          <p v-if="error" class="text-xs text-red-400">
            {{ error }}
          </p>
          <p v-if="success" class="text-xs text-emerald-400">
            {{ success }}
          </p>

          <div class="flex justify-between">
            <button
              type="button"
              class="px-3 py-2 rounded-lg border border-brand-700 text-xs text-brand-100/90 bg-brand-950/40 disabled:opacity-40"
              :disabled="step === 1"
              @click="prevStep"
            >
              Retour
            </button>

            <button
              v-if="step < maxStep"
              type="button"
              class="px-4 py-2 rounded-lg bg-secondaryBrand-500 text-brand-950 text-xs font-medium hover:bg-secondaryBrand-400 transition"
              :disabled="step === 1 && !canGoNext"
              @click="nextStep"
            >
              Étape suivante
            </button>

            <button
              v-else
              type="button"
              class="px-4 py-2 rounded-lg bg-secondaryBrand-500 text-brand-950 text-xs font-medium disabled:opacity-60 hover:bg-secondaryBrand-400 transition"
              :disabled="loading"
              @click="submit"
            >
              <span v-if="loading">Enregistrement...</span>
              <span v-else>Terminer</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
