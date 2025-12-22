<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { loggedIn, user, fetch, clear } = useUserSession()

const mode = ref<'login' | 'register'>('login')

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const error = ref<string | null>(null)

// pour tracker l'origine (ex: ?source=landing)
const source = computed(() => (route.query.source as string) || 'direct')

onMounted(async () => {
  await fetch()
  // si déjà connecté & pas onboardé → direct onboarding
  if (loggedIn.value && !user.value?.onboarded) {
    router.push('/onboarding')
  }
})

const redirectAfterAuth = async () => {
  await fetch() // rafraîchir la session
  if (user.value?.onboarded) {
    router.push('/profil')
  } else {
    router.push('/onboarding')
  }
}

const submit = async () => {
  error.value = null
  loading.value = true

  try {
    if (mode.value === 'login') {
      await $fetch('/api/login', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value,
        },
      })
    } else {
      if (password.value !== confirmPassword.value) {
        error.value = 'Les mots de passe ne correspondent pas.'
        loading.value = false
        return
      }

      await $fetch('/api/register', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value,
          source: source.value,
        },
      })
    }

    await redirectAfterAuth()
  } catch (e: any) {
    error.value = e?.data?.message || 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}

// Social logins
const loginWithGoogle = () => {
  window.location.href = '/auth/google'
}
const loginWithFacebook = () => {
  window.location.href = '/auth/facebook'
}

// Logout (optionnel sur cette page)
const logout = async () => {
  await clear()
  await fetch()
}
</script>


<template>
  <div class="min-h-screen bg-brand-950 flex items-center justify-center px-4 py-10">
    <div
      class="w-full max-w-5xl rounded-3xl overflow-hidden border border-brand-800 bg-brand-900/80 shadow-xl backdrop-blur-sm grid md:grid-cols-2"
    >
      <!-- Colonne gauche : storytelling / brand -->
      <div class="hidden md:flex flex-col justify-between bg-brand-950/80 p-8 border-r border-brand-800">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-800/80 px-3 py-1 text-[11px] font-medium">
            <span class="h-2 w-2 rounded-full bg-secondaryBrand-400" />
            <span class="text-brand-100/80">Stages & séjours escalade</span>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-semibold text-secondaryBrand-300">
              Rejoins la communauté des grimpeurs motivés 🧗‍♂️
            </h1>
            <p class="text-sm text-brand-100/80">
              Crée ton compte, remplis ton profil grimpeur et reçois des propositions de séjours / stages
              adaptés à ton niveau, ta pratique et ta vision de l’aventure.
            </p>
          </div>

          <div class="space-y-3 text-sm text-brand-100/80">
            <p class="font-medium text-secondaryBrand-300">
              Onboarding en 3 minutes :
            </p>
            <ul class="space-y-1.5">
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Parle-nous de ta pratique : bloc, couenne, grande voie…</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Indique ton niveau, ta fréquence et ton autonomie.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Découvre les prochaines aventures directement depuis ton espace.</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="text-[11px] text-brand-200/60">
          Tu pourras modifier ton profil à tout moment dans “Mon profil”.
        </div>
      </div>

      <!-- Colonne droite : authentification -->
      <div class="p-6 md:p-8 flex flex-col gap-6">
        <!-- Header mobile -->
        <div class="md:hidden space-y-2">
          <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
            Espace grimpeur
          </p>
          <h1 class="text-xl font-semibold text-secondaryBrand-300">
            Connexion / inscription
          </h1>
          <p class="text-xs text-brand-100/70">
            Renseigne ton email pour accéder à ton espace grimpeur.
          </p>
        </div>

        <!-- Toggle login / register -->
        <div class="flex text-[11px] border border-brand-700 rounded-full overflow-hidden bg-brand-900">
          <button
            type="button"
            class="flex-1 py-2"
            :class="mode === 'login'
              ? 'bg-secondaryBrand-500 text-brand-950'
              : 'bg-transparent text-brand-100/80'"
            @click="mode = 'login'"
          >
            Connexion
          </button>
          <button
            type="button"
            class="flex-1 py-2"
            :class="mode === 'register'
              ? 'bg-secondaryBrand-500 text-brand-950'
              : 'bg-transparent text-brand-100/80'"
            @click="mode = 'register'"
          >
            Inscription
          </button>
        </div>

        <!-- Boutons sociaux -->
        <div class="space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 border border-brand-700 rounded-xl px-3 py-2 text-sm bg-brand-900 hover:bg-brand-800/80 transition"
            @click="loginWithGoogle"
          >
            <span class="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[11px] text-brand-900 font-semibold">
              G
            </span>
            <span>Continuer avec Google</span>
          </button>
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 border border-brand-700 rounded-xl px-3 py-2 text-sm bg-brand-900 hover:bg-brand-800/80 transition"
            @click="loginWithFacebook"
          >
            <span class="h-5 w-5 rounded-full bg-[#1877F2] flex items-center justify-center text-[11px] font-semibold">
              f
            </span>
            <span>Continuer avec Facebook</span>
          </button>
        </div>

        <div class="relative text-center text-[11px] text-brand-200/60">
          <span class="bg-brand-900 px-2 relative z-10">ou avec ton email</span>
          <div class="absolute left-0 right-0 top-1/2 border-b border-brand-800 -z-0" />
        </div>

        <!-- Formulaire email / mot de passe -->
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-brand-100/90">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
              placeholder="ton.email@exemple.com"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-brand-100/90">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
            />
            <p class="text-[11px] text-brand-200/70">
              Minimum 6 caractères.
            </p>
          </div>

          <div v-if="mode === 'register'" class="space-y-1">
            <label class="block text-xs font-medium text-brand-100/90">
              Confirmation du mot de passe
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
            />
          </div>

          <button
            type="submit"
            class="w-full rounded-lg bg-secondaryBrand-500 text-brand-950 text-sm font-medium py-2.5 mt-1 disabled:opacity-60 hover:bg-secondaryBrand-400 transition"
            :disabled="loading"
          >
            <span v-if="loading">Traitement en cours...</span>
            <span v-else>
              {{ mode === 'login' ? 'Se connecter' : 'Créer mon compte' }}
            </span>
          </button>

          <p v-if="error" class="text-xs text-red-400 mt-1">
            {{ error }}
          </p>

          <p class="text-[11px] text-brand-200/60 mt-2">
            Source : <span class="font-medium text-secondaryBrand-300">{{ source }}</span>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
