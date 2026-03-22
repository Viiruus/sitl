<script setup lang="ts">
import {
  GUIDE_UPLOAD_ALLOWED_MIME,
  GUIDE_UPLOAD_PRESETS,
  isManagedGuideImageUrl,
} from '~~/shared/constants/guide-image-upload'

definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Profil moniteur',
  description: 'Gère ton profil public de moniteur.',
  robots: 'noindex, nofollow',
})

const router = useRouter()
const route = useRoute()
const { clear, fetch } = useUserSession()

const { data, pending, refresh } = await useFetch('/api/guides/me')
const guide = computed(() => data.value?.guide ?? null)

const form = reactive({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  whatsappOptIn: true,
  baseLocation: '',
  bio: '',
  instagramUrl: '',
  websiteUrl: '',
  professionalCardNumber: '',
  profileImageUrl: '',
  profileImageVariants: [] as { url: string; width: number; size?: number }[],
})

watch(
  () => guide.value,
  (value) => {
    if (!value) return
    form.firstName = value.firstName || ''
    form.lastName = value.lastName || ''
    form.phoneNumber = value.phoneNumber || ''
    form.whatsappOptIn = Boolean(value.whatsappOptIn)
    form.baseLocation = value.baseLocation || ''
    form.bio = value.bio || ''
    form.instagramUrl = value.instagramUrl || ''
    form.websiteUrl = value.websiteUrl || ''
    form.professionalCardNumber = value.professionalCardNumber || ''
    form.profileImageUrl = value.profileImageUrl || ''
    form.profileImageVariants = normalizeVariants(value.profileImageVariants || [])
  },
  { immediate: true },
)

const saving = ref(false)
const success = ref<string | null>(null)
const error = ref<string | null>(null)
const uploadError = ref<string | null>(null)
const uploadingPhoto = ref(false)
const isClient = ref(false)
const { uploadGuideImage } = useGuideImageUpload()

onMounted(() => {
  isClient.value = true
})

const validateProfileImage = (file: File) => {
  if (!GUIDE_UPLOAD_ALLOWED_MIME.includes(file.type as (typeof GUIDE_UPLOAD_ALLOWED_MIME)[number])) {
    return 'Format non supporté. Utilise JPG, PNG ou WebP.'
  }
  if (file.size > GUIDE_UPLOAD_PRESETS.profile.maxUploadBytes) {
    return 'Image trop lourde. Limite: 4 Mo.'
  }
  return null
}

function normalizeVariants (variants?: any[] | null) {
  if (!Array.isArray(variants)) return []
  return variants
    .map((variant: any) => ({
      url: typeof variant?.url === 'string' ? variant.url.trim() : '',
      width: Number(variant?.width),
      size: Number.isFinite(Number(variant?.size)) ? Number(variant?.size) : undefined,
    }))
    .filter((variant) => isManagedGuideImageUrl(variant.url) && Number.isFinite(variant.width) && variant.width > 0)
    .sort((a, b) => a.width - b.width)
}

const saveProfile = async () => {
  saving.value = true
  success.value = null
  error.value = null
  try {
    await $fetch('/api/guides/profile', {
      method: 'PUT',
      body: {
        ...form,
        profileImageVariants: isManagedGuideImageUrl(form.profileImageUrl) ? form.profileImageVariants : [],
      },
    })
    success.value = 'Profil mis à jour.'
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.message || 'Impossible de mettre à jour le profil.'
  } finally {
    saving.value = false
  }
}

const uploadPhoto = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  uploadError.value = null
  const fileError = validateProfileImage(file)
  if (fileError) {
    uploadError.value = fileError
    target.value = ''
    return
  }
  uploadingPhoto.value = true

  try {
    const response = await uploadGuideImage({
      file,
      kind: 'profile',
    })
    form.profileImageUrl = response.url
    form.profileImageVariants = normalizeVariants(response.variants || [])
    success.value = 'Photo mise à jour.'
  } catch (e: any) {
    uploadError.value = e?.data?.message || 'Échec du téléversement.'
  } finally {
    uploadingPhoto.value = false
    target.value = ''
  }
}

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1">
        <div v-if="guide" class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Profil public
          </p>
          <h1 class="mt-2 text-3xl font-semibold">
            Mets à jour ce que les grimpeurs voient
          </h1>
          <p class="mt-3 max-w-3xl text-sm text-brand-100/75">
            Pour que ton profil soit visible sur le site, renseigne au minimum ton prénom, ton nom, ta photo de profil, ton camp de base et ta bio.
          </p>
          <form class="mt-6 space-y-6" @submit.prevent="saveProfile">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Prénom</label>
                <input v-model="form.firstName" type="text" class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Nom</label>
                <input v-model="form.lastName" type="text" class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Téléphone (WhatsApp)</label>
              <input
                v-model="form.phoneNumber"
                type="tel"
                required
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                placeholder="+33 6 12 34 56 78"
              />
              <p class="text-xs text-brand-200/70">
                Obligatoire pour échanger rapidement avec les grimpeurs.
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Camp de base</label>
              <input v-model="form.baseLocation" type="text" class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Instagram (URL)</label>
                <input
                  v-model="form.instagramUrl"
                  type="url"
                  placeholder="https://www.instagram.com/toncompte"
                  class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Numéro de carte professionnelle</label>
                <input
                  v-model="form.professionalCardNumber"
                  type="text"
                  placeholder="Ex: 07323ED0071"
                  class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                />
                <p class="text-xs text-brand-200/70">
                  Utilisé pour générer le lien carte pro (sports.gouv.fr).
                </p>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-3">
                <label class="text-sm text-brand-100/80">Photo (URL)</label>
                <input v-model="form.profileImageUrl" type="text" class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none" />
                <p class="text-xs text-brand-200/70">
                  Tu peux coller l’URL d’une photo ou téléverser ton portrait (JPG/PNG/WebP, max 4 Mo).
                </p>
                <div v-if="isClient" class="space-y-2">
                  <label class="inline-flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5 cursor-pointer">
                    <span v-if="!uploadingPhoto">Téléverser une photo</span>
                    <span v-else class="inline-flex items-center gap-2">
                      <span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Upload en cours…
                    </span>
                    <input
                      type="file"
                      class="sr-only"
                      accept="image/png,image/jpeg,image/webp"
                      @change="uploadPhoto"
                      :disabled="uploadingPhoto"
                    />
                  </label>
                  <p v-if="uploadError" class="text-xs text-red-400">
                    {{ uploadError }}
                  </p>
                </div>
                <p v-else class="text-xs text-brand-200/60">
                  Téléversement disponible après chargement complet de la page.
                </p>
              </div>

              <div class="space-y-2">
                <label class="text-sm text-brand-100/80">Aperçu</label>
                <div class="relative aspect-[4/5] overflow-hidden rounded-2xl border border-brand-800/60 bg-brand-900/60">
                  <img
                    v-if="form.profileImageUrl"
                    :src="form.profileImageUrl"
                    alt="Photo du moniteur"
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                  <div v-else class="absolute inset-0 flex items-center justify-center text-sm text-brand-300/70">
                    Aucune photo
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Bio (publique)</label>
              <textarea
                v-model="form.bio"
                rows="4"
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
              ></textarea>
            </div>

            <div class="space-y-2">
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-xl bg-secondaryBrand-500/90 px-5 py-3 text-sm font-semibold text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:opacity-50"
                :disabled="saving"
              >
                <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
                <span>Enregistrer le profil</span>
              </button>
              <p v-if="success" class="text-sm text-secondaryBrand-200">{{ success }}</p>
              <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
            </div>
          </form>
        </div>

        <div v-else class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 text-brand-100/70">
          Chargement de ton profil…
        </div>
      </main>
    </div>
  </div>
</template>
