<script setup lang="ts">
const { loggedIn, fetch } = useUserSession()
const router = useRouter()

// Étapes
const step = ref(1)
const maxStep = 3

// Liste des départements de France (tu peux ajuster/compléter si besoin)
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

// Formulaire
const form = reactive({
  // Informations personnelles
  firstName: '',
  lastName: '',
  birthDate: '',
  department: '',

  // Pratique
  typesOfClimbing: [] as string[], // ['bloc', 'sport', 'multi']
  climbsMainly: '' as '' | 'lead' | 'toprope',
  environments: [] as string[], // ['falaise','salle_privee','salle_asso']
  autonomy: [] as string[], // valeurs prédéfinies
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
  form.typesOfClimbing.includes('multi')
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
                { n: 3, label: 'Vision du stage' },
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
              De quoi te situer un peu : qui tu es et où tu grimpes.
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

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-brand-100/90">Date de naissance</label>
              <input
                v-model="form.birthDate"
                type="date"
                class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-medium text-brand-100/90">
                Dans quel département habites-tu ?
              </label>
              <select
                v-model="form.department"
                class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
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
            </div>
          </div>

          <div
            v-if="needsRopeFields"
            class="space-y-4 border-t border-brand-800 pt-4"
          >
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
                  :class="form.environments.includes('falaise')
                    ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                    : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                  @click="toggleInArray(form.environments, 'falaise')"
                >
                  Falaise
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-full border text-xs"
                  :class="form.environments.includes('salle_privee')
                    ? 'bg-secondaryBrand-500 text-brand-950 border-secondaryBrand-500'
                    : 'bg-brand-950/40 text-brand-100/80 border-brand-700'"
                  @click="toggleInArray(form.environments, 'salle_privee')"
                >
                  Salle privée
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-full border text-xs"
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
                  <span class="text-brand-100/90">Je sais assurer quelqu'un en tête</span>
                </label>
                <label class="inline-flex items-start gap-2">
                  <input
                    type="checkbox"
                    :checked="form.autonomy.includes('manip_haut_de_voie')"
                    @change="toggleInArray(form.autonomy, 'manip_haut_de_voie')"
                  />
                  <span class="text-brand-100/90">Je sais faire la manip de haut de voie pour installer une moulinette</span>
                </label>
                <label class="inline-flex items-start gap-2">
                  <input
                    type="checkbox"
                    :checked="form.autonomy.includes('relais_grande_voie')"
                    @change="toggleInArray(form.autonomy, 'relais_grande_voie')"
                  />
                  <span class="text-brand-100/90">Je sais confectionner un relais en grande voie équipée</span>
                </label>
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

        <!-- ÉTAPE 3 -->
        <section
          v-else-if="step === 3"
          class="space-y-6"
        >
          <header class="space-y-1">
            <h2 class="text-lg font-semibold text-secondaryBrand-300">
              Ta vision d’un voyage / stage d’escalade
            </h2>
            <p class="text-xs text-brand-200/80">
              Plutôt aventure roots, confort total… ou un mélange des deux suivant les moments ?
            </p>
          </header>

          <div class="space-y-2">
            <p class="text-sm font-medium text-brand-100/90">
              Pour toi, quelle serait la forme typique d'un stage d'escalade ?
            </p>
            <div class="flex flex-col gap-2 text-sm">
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

          <p class="text-xs text-brand-200/70">
            Tes réponses ne t’engagent à rien, elles servent juste à t’envoyer les bons séjours au bon moment.
          </p>
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