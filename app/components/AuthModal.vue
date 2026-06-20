<script setup lang="ts">
import { normalizeWhatsAppPhoneNumber } from '~~/shared/utils/phone-number'

const { open, closeModal } = useAuthModal()
const route = useRoute()
const router = useRouter()
const { loggedIn, user, fetch, clear } = useUserSession()

const loading = ref(false)
const sending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const phoneNumber = ref('')
const code = ref('')
const codeSent = ref(false)
const otpToken = ref<string | null>(null)
const pendingBookingKey = 'bdk_pending_booking'
const pendingBookingIntentKey = 'bdk_pending_booking_intent'
const pendingGuideContactPathKey = 'bdk_pending_guide_contact_path'
const pendingStageNotificationKey = 'bdk_pending_stage_notification'
const pendingGuideStageNotificationKey = 'bdk_pending_guide_stage_notification'
const skipPendingClear = ref(false)

const source = computed(() => (route.query.source as string) || 'direct')

const getFetchErrorMessage = (e: any, fallback: string) =>
  e?.data?.message || e?.data?.statusMessage || e?.statusMessage || e?.message || fallback

const withGuideStageNotificationQuery = (path: string) => {
  if (path.includes('notifyGuideStages=1')) return path
  return path.includes('?') ? `${path}&notifyGuideStages=1` : `${path}?notifyGuideStages=1`
}

const resetState = () => {
  error.value = null
  success.value = null
  codeSent.value = false
  otpToken.value = null
  phoneNumber.value = ''
  code.value = ''
}

watch(open, (val) => {
  if (!val) {
    resetState()
    if (!skipPendingClear.value && !loggedIn.value && typeof window !== 'undefined') {
      window.localStorage.removeItem(pendingBookingKey)
      window.localStorage.removeItem(pendingBookingIntentKey)
      window.localStorage.removeItem(pendingGuideContactPathKey)
      window.localStorage.removeItem(pendingStageNotificationKey)
      window.localStorage.removeItem(pendingGuideStageNotificationKey)
    }
    skipPendingClear.value = false
  }
})

const redirectAfterAuth = async () => {
  await fetch()
  skipPendingClear.value = true
  closeModal()

  if (!user.value?.onboarded) {
    await router.push('/onboarding')
    return
  }

  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(pendingBookingKey)
    if (raw) {
      try {
        const payload = JSON.parse(raw)
        const pendingSlug = payload?.slug
        if (pendingSlug) {
          const target = `/stages-escalade/${pendingSlug}`
          if (route.path !== target) {
            await router.push(target)
          }
          window.localStorage.removeItem(pendingBookingKey)
          window.localStorage.removeItem(pendingBookingIntentKey)
          return
        }
      } catch (error) {
        window.localStorage.removeItem(pendingBookingKey)
      }
    }

    const intentSlug = window.localStorage.getItem(pendingBookingIntentKey)
    if (intentSlug) {
      const target = `/stages-escalade/${intentSlug}`
      if (route.path !== target) {
        await router.push(target)
      }
      window.localStorage.removeItem(pendingBookingIntentKey)
      return
    }

    const contactPath = window.localStorage.getItem(pendingGuideContactPathKey)
    if (contactPath) {
      const target = contactPath.includes('?') ? `${contactPath}&contact=1` : `${contactPath}?contact=1`
      if (route.fullPath !== target) {
        await router.push(target)
      }
      window.localStorage.removeItem(pendingGuideContactPathKey)
      return
    }

    const stageNotificationRaw = window.localStorage.getItem(pendingStageNotificationKey)
    if (stageNotificationRaw) {
      let target = '/stages-escalade?notifyStages=1'
      try {
        const payload = JSON.parse(stageNotificationRaw)
        const path = typeof payload?.path === 'string' && payload.path ? payload.path : '/stages-escalade'
        target = path.includes('?') ? `${path}&notifyStages=1` : `${path}?notifyStages=1`
      } catch {
        target = '/stages-escalade?notifyStages=1'
      }
      if (route.fullPath !== target) {
        await router.push(target)
      }
      return
    }

    const guideStageNotificationRaw = window.localStorage.getItem(pendingGuideStageNotificationKey)
    if (guideStageNotificationRaw) {
      let target = withGuideStageNotificationQuery(route.path.includes('/moniteurs/') ? route.path : '/moniteurs')
      try {
        const payload = JSON.parse(guideStageNotificationRaw)
        const path = typeof payload?.path === 'string' && payload.path ? payload.path : '/moniteurs'
        target = withGuideStageNotificationQuery(path)
      } catch {
        target = withGuideStageNotificationQuery('/moniteurs')
      }
      if (route.fullPath !== target) {
        await router.push(target)
      }
      return
    }
  }

  if (user.value?.onboarded) {
    router.push('/profil')
  } else {
    router.push('/onboarding')
  }
}

const requestCode = async () => {
  error.value = null
  success.value = null
  const normalizedPhone = normalizeWhatsAppPhoneNumber(phoneNumber.value)
  if (!normalizedPhone) {
    error.value = 'Numéro de téléphone invalide.'
    return
  }

  phoneNumber.value = normalizedPhone
  sending.value = true
  try {
    await clear()
    await fetch()
    const res: any = await $fetch('/api/auth/whatsapp', {
      method: 'POST',
      body: {
        phoneNumber: normalizedPhone,
        source: source.value,
      },
    })
    codeSent.value = true
    otpToken.value = res?.token || null
    success.value = res?.devCode
      ? `Code de test : ${res.devCode}`
      : 'Code envoyé sur WhatsApp.'
  } catch (e: any) {
    error.value = getFetchErrorMessage(e, 'Une erreur est survenue.')
  }
  sending.value = false
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
  const normalizedPhone = normalizeWhatsAppPhoneNumber(phoneNumber.value)
  if (!normalizedPhone) {
    error.value = 'Numéro de téléphone invalide.'
    loading.value = false
    return
  }

  phoneNumber.value = normalizedPhone
  try {
    await $fetch('/api/auth/whatsapp/verify', {
      method: 'POST',
      body: {
        phoneNumber: normalizedPhone,
        code: code.value,
        token: otpToken.value,
        source: source.value,
      },
    })
    await redirectAfterAuth()
  } catch (e: any) {
    error.value = getFetchErrorMessage(e, 'Code invalide ou expiré.')
  }
  loading.value = false
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal" />

        <div
          class="relative w-full max-w-5xl rounded-3xl overflow-hidden border border-brand-800 bg-brand-900/95 shadow-2xl backdrop-blur grid md:grid-cols-2"
        >
          <!-- Colonne gauche : storytelling / brand -->
          <div class="hidden md:flex flex-col justify-between bg-brand-950/80 p-8 border-r border-brand-800">
            <div class="space-y-6">
              <div class="inline-flex items-center gap-2 rounded-full bg-brand-800/80 px-3 py-1 text-[11px] font-medium">
                <span class="h-2 w-2 rounded-full bg-secondaryBrand-400" />
                <span class="text-brand-100/80">Connexion WhatsApp</span>
              </div>

              <div class="space-y-2">
                <h1 class="text-2xl font-semibold text-secondaryBrand-300">
                  Rejoins la communauté via WhatsApp
                </h1>
                <p class="text-sm text-brand-100/80">
                  Utilise ton numéro WhatsApp pour créer ton compte ou te connecter. On t’enverra une
                  confirmation pour finaliser la création de ton espace grimpeur.
                </p>
              </div>

              <div class="space-y-3 text-sm text-brand-100/80">
                <p class="font-medium text-secondaryBrand-300">
                  Comment ça marche :
                </p>
                <ul class="space-y-1.5">
                  <li class="flex items-start gap-2">
                    <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                    <span>Tu installes l'application WhatsApp sur ton téléphone.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                    <span>Tu confirmes ton numéro et valides la connexion.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="mt-[5px] h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                    <span>Tu arrives sur ton espace pour compléter ton profil et réserver.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Colonne droite : authentification WhatsApp -->
          <div class="relative p-6 md:p-8 flex flex-col gap-6">
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
              @click="closeModal"
            >
              <span class="sr-only">Fermer</span>
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>

            <!-- Header mobile -->
            <div class="md:hidden space-y-2">
              <p class="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
                Espace grimpeur
              </p>
              <h1 class="text-xl font-semibold text-secondaryBrand-300">
                Connexion / inscription
              </h1>
              <p class="text-xs text-brand-100/70">
                Connecte-toi avec ton numéro WhatsApp pour accéder à ton espace grimpeur.
              </p>
            </div>

            <div class="space-y-4">
              <h1 class="text-xl font-semibold text-secondaryBrand-300">
                Inscription via WhatsApp
              </h1>

              <p class="text-sm text-brand-100/80">
                Nous utilisons WhatsApp pour vérifier ton numéro et t’ouvrir l’accès aux prochaines aventures.
              </p>

              <div class="space-y-2">
                <label class="block text-xs font-medium text-brand-100/90">
                  Numéro WhatsApp
                </label>
                <input
                  v-model="phoneNumber"
                  type="tel"
                  inputmode="tel"
                  placeholder="+33 6 12 34 56 78"
                  class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                />
                <p class="text-[11px] text-brand-200/70">
                  Un code à 6 chiffres sera envoyé sur WhatsApp. Valide-le pour te connecter.
                </p>
                <details class="text-[11px] text-brand-200/70">
                  <summary class="cursor-pointer select-none text-brand-200/80 underline underline-offset-2 hover:text-white">
                    Le code n’arrive pas ?
                  </summary>
                  <div class="mt-2 space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-3 text-brand-100/80">
                    <p>Mets à jour l’application WhatsApp, puis réessaie.</p>
                    <p>
                      Si le code n’arrive toujours pas, écris-nous à
                      <a href="mailto:yo@brigadedukiff.com" class="font-semibold text-secondaryBrand-200 underline underline-offset-2 hover:text-white">
                        yo@brigadedukiff.com
                      </a>.
                    </p>
                  </div>
                </details>
              </div>

              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 text-brand-950 font-semibold shadow-lg shadow-[#25D366]/30 transition hover:translate-y-[-1px] hover:shadow-xl disabled:opacity-60"
                :disabled="sending || !phoneNumber"
                @click="requestCode"
              >
                <svg class="h-5 w-5" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                  <path
                    d="M16 3C9.4 3 4 8.2 4 14.7c0 2.4.7 4.6 2 6.5L4 29l8-1.8c1.3.4 2.7.6 4 .6 6.6 0 12-5.2 12-11.7C28 8.2 22.6 3 16 3Zm0 2c5.5 0 10 4.3 10 9.7S21.5 24.4 16 24.4c-1.3 0-2.5-.2-3.7-.7l-.8-.3-.8.2-3.9.9 1.1-3.3.2-.7-.5-.6c-1.1-1.6-1.6-3.4-1.6-5.3C6 9.3 10.5 5 16 5Zm5.2 10.9c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.2.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.3-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.3 5 4.5.7.3 1.2.5 1.6.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.1-.5-.2Z"
                  />
                </svg>
                <span v-if="sending">Envoi du code…</span>
                <span v-else>Recevoir le code WhatsApp</span>
              </button>

              <div v-if="codeSent" class="space-y-2">
                <label class="block text-xs font-medium text-brand-100/90">
                  Code reçu
                </label>
                <input
                  v-model="code"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  class="w-full border border-brand-700 rounded-lg px-3 py-2 text-sm bg-brand-950/50 text-white placeholder:text-brand-200/50 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-500 focus:border-secondaryBrand-500"
                  placeholder="123456"
                />
                <button
                  type="button"
                  class="w-full rounded-lg bg-secondaryBrand-500 text-brand-950 text-sm font-semibold py-2.5 mt-1 disabled:opacity-60 hover:bg-secondaryBrand-400 transition"
                  :disabled="loading || !code || !otpToken"
                  @click="verifyCode"
                >
                  <span v-if="loading">Vérification…</span>
                  <span v-else>Confirmer et se connecter</span>
                </button>
              </div>
            </div>

            <p v-if="success" class="text-xs text-secondaryBrand-300">
              {{ success }}
            </p>
            <p v-if="error" class="text-xs text-red-400 mt-1">
              {{ error }}
            </p>

          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
