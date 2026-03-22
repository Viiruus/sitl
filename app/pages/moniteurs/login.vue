<script setup lang="ts">
import { getAssociationMembershipOffer } from '~~/shared/constants/association-membership'

const router = useRouter()
const { loggedIn, user, fetch, clear } = useUserSession()

useSeoMeta({
  title: 'Espace moniteur | Inscription WhatsApp',
  description: 'Créer son compte moniteur et se connecter via WhatsApp.',
  robots: 'noindex, nofollow',
})

const phoneNumber = ref('')
const code = ref('')
const codeSent = ref(false)
const otpToken = ref<string | null>(null)
const needsOnboarding = ref(false)
const guideFirstName = ref('')
const guideLastName = ref('')
const cguAccepted = ref(false)
const associationMembershipAccepted = ref(false)

const loading = ref(false)
const sending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const membershipOffer = getAssociationMembershipOffer()

onMounted(async () => {
  await fetch()
  // If logged as climber, clear to avoid mixed roles
  if (loggedIn.value && user.value?.role !== 'GUIDE') {
    await clear()
    await fetch()
  } else if (loggedIn.value && user.value?.role === 'GUIDE' && user.value?.onboarded) {
    router.push('/moniteurs')
  } else if (loggedIn.value && user.value?.role === 'GUIDE' && !user.value?.onboarded) {
    needsOnboarding.value = true
    guideFirstName.value = user.value?.firstName || ''
    guideLastName.value = user.value?.lastName || ''
    phoneNumber.value = user.value?.phoneNumber || ''
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

const requestCode = async () => {
  error.value = null
  success.value = null
  sending.value = true

  try {
    await clear()
    await fetch()
    const res: any = await $fetch('/api/moniteurs/auth/whatsapp', {
      method: 'POST',
      body: {
        phoneNumber: phoneNumber.value,
        source: 'guide',
      },
    })
    codeSent.value = true
    otpToken.value = res?.token || null
    success.value = res?.devCode
      ? `Code de test : ${res.devCode}`
      : 'Code envoyé sur WhatsApp.'
  } catch (e: any) {
    error.value = e?.data?.message || 'Une erreur est survenue.'
  } finally {
    sending.value = false
  }
}

const verifyCode = async () => {
  error.value = null
  success.value = null
  loading.value = true
  if (!otpToken.value) {
    error.value = 'Demande un code avant de valider.'
    loading.value = false
    return
  }
  try {
    const res: any = await $fetch('/api/moniteurs/auth/whatsapp/verify', {
      method: 'POST',
      body: {
        phoneNumber: phoneNumber.value,
        code: code.value,
        token: otpToken.value,
        source: 'guide',
      },
    })
    if (res?.requiresOnboarding) {
      needsOnboarding.value = true
      return
    }
    await redirectAfterAuth()
  } catch (e: any) {
    error.value = e?.data?.message || 'Code invalide ou expiré.'
  } finally {
    loading.value = false
  }
}

const submitOnboarding = async () => {
  error.value = null
  success.value = null
  loading.value = true
  try {
    await $fetch('/api/moniteurs/onboarding', {
      method: 'POST',
      body: {
        firstName: guideFirstName.value,
        lastName: guideLastName.value,
        cguAccepted: cguAccepted.value,
        associationMembershipAccepted: associationMembershipAccepted.value,
      },
    })
    await redirectAfterAuth()
  } catch (e: any) {
    error.value = e?.data?.message || 'Impossible de finaliser le profil.'
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
              Diffuse tes prestations escalade grâce à la Brigade du kiff
            </h1>
            <p class="text-sm text-brand-100/80">
              Crée ton compte moniteur, publie tes aventures et suis tes inscriptions depuis une interface dédiée.
            </p>
          </div>
          <div class="space-y-3 text-sm text-brand-100/80">
            <p class="font-medium text-secondaryBrand-300">
              Les prochaines étapes (rien de plus simple) :
            </p>
            <ul class="space-y-1.5">
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Mets à jour ton profil public : bio, photo, camp de base.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Publie tes prestations d’encadrement escalade.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                <span>Organise directement tes stages avec les personnes inscrites.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="p-6 md:p-8 flex flex-col gap-6">
        <div class="space-y-3">
          <h1 class="text-xl font-semibold text-secondaryBrand-300">
            Inscription via WhatsApp
          </h1>
          <p class="text-xs text-brand-100/70">
            Fini les boites mails pleines et les mots de passe oubliés, l’inscription est ultra simplifiée : il te suffit d’avoir l’application WhatsApp sur ton téléphone et de renseigner ton numéro. Un code te sera envoyé pour te connecter.
          </p>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="needsOnboarding ? submitOnboarding() : (codeSent ? verifyCode() : requestCode())"
        >
          <div v-if="!needsOnboarding" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Numéro WhatsApp</label>
              <input
                v-model="phoneNumber"
                type="tel"
                required
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                placeholder="+33 6 12 34 56 78"
              />
              <p class="text-xs text-brand-200/70">
                Un code de connexion sera envoyé sur WhatsApp.
              </p>
            </div>

            <div v-if="codeSent" class="space-y-2">
              <label class="text-sm text-brand-100/80">Code reçu</label>
              <input
                v-model="code"
                type="text"
                required
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                placeholder="123456"
              />
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="space-y-2">
              <p class="text-xs uppercase tracking-[0.2em] text-brand-200/70">
                Dernière étape
              </p>
              <h2 class="text-lg font-semibold text-secondaryBrand-200">
                Finalise ton compte moniteur
              </h2>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Prénom</label>
                <input
                  v-model="guideFirstName"
                  type="text"
                  required
                  class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Nom</label>
                <input
                  v-model="guideLastName"
                  type="text"
                  required
                  class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                />
              </div>
            </div>
            <p class="text-xs text-brand-100/70">
              Je reconnais être seul organisateur et seul responsable des stages que je publie (sécurité, conformité, assurance, paiement, annulation, facturation).
              Brigade du kiff est une plateforme de mise en relation et n’est pas partie au contrat avec les grimpeurs.
            </p>
            <label class="flex items-start gap-3 text-xs text-brand-100/80">
              <input
                v-model="cguAccepted"
                type="checkbox"
                class="mt-0.5 h-4 w-4 rounded border-brand-700 bg-brand-900 text-secondaryBrand-400 focus:ring-secondaryBrand-400"
                required
              />
              <span>
                J’ai lu et j’accepte les
                <NuxtLink
                  to="/moniteurs/cgu"
                  target="_blank"
                  rel="noopener"
                  class="text-secondaryBrand-200 underline hover:text-secondaryBrand-100"
                >
                  CGU moniteurs
                </NuxtLink>.
              </span>
            </label>
            <label class="flex items-start gap-3 text-xs text-brand-100/80">
              <input
                v-model="associationMembershipAccepted"
                type="checkbox"
                class="mt-0.5 h-4 w-4 rounded border-brand-700 bg-brand-900 text-secondaryBrand-400 focus:ring-secondaryBrand-400"
                required
              />
              <span>
                Je souhaite adhérer à l'association Brigade du kiff pour l'année {{ membershipOffer.year }} pour la somme de {{ membershipOffer.amountLabel }}
                et j’ai pris connaissance des
                <a
                  :href="membershipOffer.statutesUrl"
                  target="_blank"
                  rel="noopener"
                  class="text-secondaryBrand-200 underline hover:text-secondaryBrand-100"
                >
                  statuts
                </a>
                et du
                <a
                  :href="membershipOffer.internalRulesUrl"
                  target="_blank"
                  rel="noopener"
                  class="text-secondaryBrand-200 underline hover:text-secondaryBrand-100"
                >
                  règlement intérieur
                </a>.
              </span>
            </label>
          </div>

          <p v-if="success" class="text-sm text-emerald-200">{{ success }}</p>
          <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

          <button
            type="submit"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondaryBrand-500/90 px-4 py-3 text-sm font-semibold text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:opacity-50"
            :disabled="loading || sending || (needsOnboarding && (!cguAccepted || !associationMembershipAccepted))"
          >
            <span v-if="loading || sending" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
            <span>
              {{
                needsOnboarding
                  ? 'Accéder au dashboard'
                  : codeSent
                    ? 'Valider le code'
                    : 'Recevoir le code WhatsApp'
              }}
            </span>
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
