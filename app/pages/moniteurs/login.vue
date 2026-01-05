<script setup lang="ts">
const router = useRouter()
const { loggedIn, user, fetch, clear } = useUserSession()

const mode = ref<'login' | 'register'>('login')

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const baseLocation = ref('')
const phoneNumber = ref('')
const whatsappOptIn = ref(true)

const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await fetch()
  if (loggedIn.value && user.value?.role === 'GUIDE') {
    router.push('/moniteurs')
  }
})

const redirectAfterAuth = async () => {
  await fetch()
  if (user.value?.role === 'GUIDE') {
    router.push('/moniteurs')
  } else {
    router.push('/')
  }
}

const submit = async () => {
  error.value = null
  loading.value = true

  try {
    if (mode.value === 'login') {
      await $fetch('/api/moniteurs/login', {
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

      await $fetch('/api/moniteurs/register', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value,
          firstName: firstName.value,
          lastName: lastName.value,
          baseLocation: baseLocation.value,
          phoneNumber: phoneNumber.value,
          whatsappOptIn: whatsappOptIn.value,
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

const logout = async () => {
  await clear()
  await fetch()
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-5xl rounded-3xl overflow-hidden border border-brand-800 bg-brand-900/80 shadow-xl backdrop-blur-sm grid md:grid-cols-2">
      <div class="hidden md:flex flex-col justify-between bg-brand-950/80 p-8 border-r border-brand-800">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-800/80 px-3 py-1 text-[11px] font-medium">
            <span class="h-2 w-2 rounded-full bg-secondaryBrand-400" />
            <span class="text-brand-100/80">Espace moniteur</span>
          </div>
          <div class="space-y-2">
            <h1 class="text-2xl font-semibold text-secondaryBrand-300">
              Gère tes aventures & ton profil guide ✨
            </h1>
            <p class="text-sm text-brand-100/80">
              Crée ton compte guide, publie tes aventures et suis tes réservations depuis une interface dédiée.
            </p>
          </div>
          <div class="space-y-3 text-sm text-brand-100/80">
            <p class="font-medium text-secondaryBrand-300">
              Ce que tu peux faire :
            </p>
            <ul class="space-y-1.5">
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Mettre à jour ton profil public : bio, photo, base camp.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Créer des aventures, publier des dates et suivre les messages.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Consulter les bookings et suggestions reçues.</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="text-[11px] text-brand-200/60">
          Besoin d'accéder à l'espace grimpeur ?
          <NuxtLink to="/login" class="text-secondaryBrand-300 hover:text-secondaryBrand-200">Clique ici</NuxtLink>
        </div>
      </div>

      <div class="p-6 md:p-8 flex flex-col gap-6">
        <div class="md:hidden space-y-2">
          <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
            Espace moniteur
          </p>
          <h1 class="text-xl font-semibold text-secondaryBrand-300">
            Connexion / inscription
          </h1>
          <p class="text-xs text-brand-100/70">
            Publie tes aventures et garde le contact avec les grimpeurs motivés.
          </p>
        </div>

        <div class="flex text-[11px] border border-brand-700 rounded-full overflow-hidden bg-brand-900">
          <button
            type="button"
            class="flex-1 py-2"
            :class="mode === 'login' ? 'bg-secondaryBrand-500 text-brand-950' : 'bg-transparent text-brand-100/80'"
            @click="mode = 'login'"
          >
            Connexion
          </button>
          <button
            type="button"
            class="flex-1 py-2"
            :class="mode === 'register' ? 'bg-secondaryBrand-500 text-brand-950' : 'bg-transparent text-brand-100/80'"
            @click="mode = 'register'"
          >
            Inscription
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <label class="text-sm text-brand-100/80">Email</label>
            <input v-model="email" type="email" required class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
          </div>

          <div class="grid gap-4" :class="mode === 'register' ? 'md:grid-cols-2' : ''" v-if="mode === 'register'">
            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Prénom</label>
              <input v-model="firstName" type="text" required class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Nom</label>
              <input v-model="lastName" type="text" required class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
            </div>
          </div>

          <div v-if="mode === 'register'" class="space-y-2">
            <label class="text-sm text-brand-100/80">Camp de base (facultatif)</label>
            <input v-model="baseLocation" type="text" class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
          </div>

          <div v-if="mode === 'register'" class="space-y-2">
            <label class="text-sm text-brand-100/80">Téléphone (WhatsApp)</label>
            <input
              v-model="phoneNumber"
              type="tel"
              required
              class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
              placeholder="+33 6 12 34 56 78"
            />
            <p class="text-xs text-brand-200/70">
              Indispensable pour échanger rapidement avec les grimpeurs.
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm text-brand-100/80">Mot de passe</label>
            <input v-model="password" type="password" required class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
          </div>

          <div v-if="mode === 'register'" class="space-y-2">
            <label class="text-sm text-brand-100/80">Confirmer le mot de passe</label>
            <input v-model="confirmPassword" type="password" required class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
          </div>

          <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

          <button
            type="submit"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondaryBrand-500/90 px-4 py-3 text-sm font-semibold text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
            <span>{{ mode === 'login' ? 'Se connecter' : 'Créer mon espace guide' }}</span>
          </button>
          <button
            v-if="loggedIn && user?.role !== 'GUIDE'"
            type="button"
            class="text-xs text-brand-400 underline"
            @click="logout"
          >
            Se déconnecter du compte actuel
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
