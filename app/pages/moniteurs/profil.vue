<script setup lang="ts">
import {
  GUIDE_UPLOAD_ALLOWED_MIME,
  GUIDE_UPLOAD_PRESETS,
  isManagedGuideImageUrl,
} from '~~/shared/constants/guide-image-upload'
import {
  GUIDE_STAGE_TERMS_GLOBAL_VARIABLES,
  GUIDE_STAGE_TERMS_STAGE_VARIABLES,
  buildDefaultGuideStageTerms,
  formatGuideStageTermsGlobalVariableMarkers,
} from '~~/shared/constants/guide-stage-terms'

definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Profil moniteur·ice',
  description: 'Gère ton profil public de moniteur·ice.',
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
  gender: '',
  baseLocation: '',
  baseLatitude: null as number | null,
  baseLongitude: null as number | null,
  serviceAreasText: '',
  bio: '',
  stageTermsAndConditions: '',
  instagramUrl: '',
  googleBusinessUrl: '',
  googlePlaceId: '',
  professionalCardNumber: '',
  profileImageUrl: '',
  profileImageVariants: [] as { url: string; width: number; size?: number }[],
})

watch(
  () => guide.value,
  (value) => {
    if (!value) return
    const currentGuideName = [value.firstName, value.lastName].filter(Boolean).join(' ').trim() || null
    form.firstName = value.firstName || ''
    form.lastName = value.lastName || ''
    form.phoneNumber = value.phoneNumber || ''
    form.whatsappOptIn = Boolean(value.whatsappOptIn)
    form.gender = value.gender || ''
    form.baseLocation = value.baseLocation || ''
    form.baseLatitude = typeof value.baseLatitude === 'number' ? value.baseLatitude : null
    form.baseLongitude = typeof value.baseLongitude === 'number' ? value.baseLongitude : null
    form.serviceAreasText = Array.isArray(value.serviceAreas) ? value.serviceAreas.join('\n') : ''
    form.bio = value.bio || ''
    form.stageTermsAndConditions = value.stageTermsAndConditions
      ? formatGuideStageTermsGlobalVariableMarkers(value.stageTermsAndConditions)
      : buildDefaultGuideStageTerms({
          guideName: currentGuideName,
          professionalCardNumber: value.professionalCardNumber || null,
        })
    form.instagramUrl = value.instagramUrl || ''
    form.googleBusinessUrl = value.googleBusinessUrl || ''
    form.googlePlaceId = value.googlePlaceId || ''
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
const baseLocationSearching = ref(false)
const baseLocationSearchError = ref<string | null>(null)
const baseLocationSuggestions = ref<Array<{
  id: string
  label: string
  latitude: number
  longitude: number
}>>([])
const selectedBaseLocationLabel = ref<string | null>(null)
const isClient = ref(false)
const { uploadGuideImage } = useGuideImageUpload()
const stageTermsGlobalVariableExamples = GUIDE_STAGE_TERMS_GLOBAL_VARIABLES.slice(0, 8)
const stageTermsPolicyVariableExamples = GUIDE_STAGE_TERMS_GLOBAL_VARIABLES.slice(8)
const stageTermsStageVariableExamples = GUIDE_STAGE_TERMS_STAGE_VARIABLES

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

const resetStageTermsToDefault = () => {
  const currentGuideName = [form.firstName, form.lastName].filter(Boolean).join(' ').trim() || null
  form.stageTermsAndConditions = buildDefaultGuideStageTerms({
    guideName: currentGuideName,
    professionalCardNumber: form.professionalCardNumber || null,
  })
}

const hasBaseCoordinates = computed(() =>
  typeof form.baseLatitude === 'number' &&
  Number.isFinite(form.baseLatitude) &&
  typeof form.baseLongitude === 'number' &&
  Number.isFinite(form.baseLongitude),
)

const handleBaseLocationInput = () => {
  form.baseLatitude = null
  form.baseLongitude = null
  selectedBaseLocationLabel.value = null
  baseLocationSuggestions.value = []
  baseLocationSearchError.value = null
}

const searchBaseLocation = async () => {
  const query = form.baseLocation.trim()
  baseLocationSearchError.value = null
  baseLocationSuggestions.value = []
  selectedBaseLocationLabel.value = null

  if (query.length < 2) {
    baseLocationSearchError.value = 'Renseigne un camp de base plus précis.'
    return
  }

  baseLocationSearching.value = true
  try {
    const response = await $fetch<{
      suggestions: Array<{
        id: string
        label: string
        latitude: number
        longitude: number
      }>
    }>('/api/guides/base-location-suggestions', {
      query: { q: query },
    })
    baseLocationSuggestions.value = response.suggestions
    if (!response.suggestions.length) {
      baseLocationSearchError.value = 'Aucun lieu trouvé. Ajoute une commune ou un département.'
    }
  } catch (e: any) {
    baseLocationSearchError.value = e?.data?.message || 'Impossible de rechercher ce lieu.'
  } finally {
    baseLocationSearching.value = false
  }
}

const selectBaseLocation = (suggestion: {
  label: string
  latitude: number
  longitude: number
}) => {
  form.baseLatitude = suggestion.latitude
  form.baseLongitude = suggestion.longitude
  selectedBaseLocationLabel.value = suggestion.label
  baseLocationSuggestions.value = []
  baseLocationSearchError.value = null
}

const saveProfile = async () => {
  saving.value = true
  success.value = null
  error.value = null
  try {
    const serviceAreas = form.serviceAreasText
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    await $fetch('/api/guides/profile', {
      method: 'PUT',
      body: {
        ...form,
        serviceAreas,
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
            Mets à jour ce que les grimpeur·euse·s voient
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
              <label class="text-sm text-brand-100/80">Genre</label>
              <select
                v-model="form.gender"
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
              >
                <option value="">Non renseigné</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </select>
              <p class="text-xs text-brand-200/70">
                Utilisé pour afficher automatiquement `moniteur` ou `monitrice` sur le site.
              </p>
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
                Obligatoire pour échanger rapidement avec les grimpeur·euse·s.
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Camp de base</label>
              <div class="flex flex-col gap-2 sm:flex-row">
                <input
                  v-model="form.baseLocation"
                  type="text"
                  class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                  placeholder="Ex. Massif des Bauges, Savoie"
                  @input="handleBaseLocationInput"
                  @keydown.enter.prevent="searchBaseLocation"
                />
                <button
                  type="button"
                  class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-secondaryBrand-300/40 bg-secondaryBrand-400/10 px-4 py-2 text-sm font-semibold text-secondaryBrand-200 transition hover:bg-secondaryBrand-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="baseLocationSearching || form.baseLocation.trim().length < 2"
                  @click="searchBaseLocation"
                >
                  <span v-if="baseLocationSearching" class="size-4 animate-spin rounded-full border-2 border-secondaryBrand-200 border-t-transparent" />
                  <svg v-else class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path stroke-linecap="round" d="m16 16 4 4" />
                  </svg>
                  Rechercher ce lieu
                </button>
              </div>
              <p class="text-xs text-brand-200/70">
                Saisis un massif, une ville ou un village, puis choisis la proposition correspondante.
              </p>

              <div v-if="baseLocationSuggestions.length" class="overflow-hidden rounded-xl border border-white/10 bg-brand-950/70">
                <button
                  v-for="suggestion in baseLocationSuggestions"
                  :key="suggestion.id"
                  type="button"
                  class="flex w-full items-start gap-3 border-b border-white/10 px-4 py-3 text-left text-sm text-brand-100/85 transition last:border-b-0 hover:bg-white/5 hover:text-white"
                  @click="selectBaseLocation(suggestion)"
                >
                  <svg class="mt-0.5 size-4 shrink-0 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                    <circle cx="12" cy="11" r="2.3" />
                  </svg>
                  <span>{{ suggestion.label }}</span>
                </button>
              </div>

              <p v-if="baseLocationSearchError" class="text-xs text-red-300">
                {{ baseLocationSearchError }}
              </p>

              <div v-if="hasBaseCoordinates" class="flex items-center justify-between gap-4 rounded-xl border border-secondaryBrand-300/20 bg-secondaryBrand-400/10 px-4 py-3">
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-secondaryBrand-200">Localisation sélectionnée</p>
                  <p class="mt-1 line-clamp-2 text-xs text-brand-100/70">
                    {{ selectedBaseLocationLabel || form.baseLocation }}
                  </p>
                  <p class="mt-1 text-[10px] text-brand-200/55">
                    {{ form.baseLatitude?.toFixed(5) }}, {{ form.baseLongitude?.toFixed(5) }}
                  </p>
                </div>
                <GuideFranceLocator
                  :department="guide?.department"
                  :latitude="form.baseLatitude"
                  :longitude="form.baseLongitude"
                  :location-label="form.baseLocation"
                />
              </div>

              <p class="text-[10px] text-brand-200/50">
                Géocodage :
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener"
                  class="underline underline-offset-2 hover:text-brand-100"
                >
                  données © contributeurs OpenStreetMap
                </a>.
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Zones desservies</label>
              <textarea
                v-model="form.serviceAreasText"
                rows="4"
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                placeholder="Une zone par ligne ou séparée par des virgules&#10;Ex: Bauges&#10;Annecy&#10;Chambéry"
              ></textarea>
              <p class="text-xs text-brand-200/70">
                Ces zones seront affichées sur ta page publique et utilisées dans le balisage SEO local.
              </p>
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
                <label class="text-sm text-brand-100/80">Fiche Google (URL)</label>
                <input
                  v-model="form.googleBusinessUrl"
                  type="url"
                  placeholder="https://g.page/..."
                  class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                />
                <p class="text-xs text-brand-200/70">
                  Lien public vers ta fiche Google.
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm text-brand-100/80">Google Place ID</label>
              <input
                v-model="form.googlePlaceId"
                type="text"
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
              />
              <p class="text-xs text-brand-200/70">
                Utilisé côté serveur pour récupérer automatiquement la note et les avis Google. Sans cet identifiant, l’encart `Avis Google` ne pourra pas être enrichi.
              </p>
              <p class="text-xs text-brand-200/70">
                Tu peux le trouver avec le
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener"
                  class="font-semibold text-secondaryBrand-200 hover:text-secondaryBrand-100"
                >
                  Place ID Finder de Google
                </a>.
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
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
                <p class="rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  Assure-toi d’utiliser une photo dont tu détiens les droits, ou une photo libre de droits autorisée pour un usage commercial.
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
                    alt="Photo du profil"
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

            <div class="space-y-3 rounded-2xl border border-white/10 bg-brand-900/40 p-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label class="text-sm font-medium text-brand-100/80">Conditions générales de vente (CGV)</label>
                  <p class="mt-1 text-xs text-brand-200/70">
                    Modèle transverse à tous tes stages. Les variables globales se règlent ici, les variables de stage sont injectées automatiquement depuis les informations du stage que tu crées.
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/5"
                  @click="resetStageTermsToDefault"
                >
                  Réinitialiser le modèle
                </button>
              </div>

              <div class="grid gap-4 lg:grid-cols-2">
                <div class="rounded-2xl border border-secondaryBrand-300/20 bg-secondaryBrand-400/10 p-4">
                  <div class="flex items-start gap-3">
                    <span class="mt-0.5 rounded-lg bg-secondaryBrand-300 px-2 py-1 font-mono text-xs font-semibold text-brand-950">
                      {...}
                    </span>
                    <div class="space-y-2">
                      <h3 class="text-sm font-semibold text-secondaryBrand-100">
                        Variables globales moniteur·ice
                      </h3>
                      <p class="text-xs leading-5 text-brand-100/75">
                        Elles décrivent ton activité, tes règles commerciales ou tes infos légales. Complète-les une fois
                        dans ce modèle : elles seront utilisées de la même façon sur toutes tes fiches stage.
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <code
                      v-for="variable in stageTermsGlobalVariableExamples"
                      :key="variable"
                      class="rounded-full border border-secondaryBrand-300/25 bg-brand-950/50 px-2.5 py-1 text-[11px] text-secondaryBrand-100"
                    >{{ '{' + variable + '}' }}</code>
                  </div>
                  <details class="mt-3 text-xs text-brand-100/70">
                    <summary class="cursor-pointer select-none font-semibold text-secondaryBrand-200">
                      Voir les variables de règles commerciales
                    </summary>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <code
                        v-for="variable in stageTermsPolicyVariableExamples"
                        :key="variable"
                        class="rounded-full border border-white/10 bg-brand-950/50 px-2.5 py-1 text-[11px] text-brand-100/80"
                      >{{ '{' + variable + '}' }}</code>
                    </div>
                  </details>
                </div>

                <div class="rounded-2xl border border-white/10 bg-brand-950/50 p-4">
                  <div class="flex items-start gap-3">
                    <span class="mt-0.5 rounded-lg bg-white/10 px-2 py-1 font-mono text-xs font-semibold text-white">
                      [...]
                    </span>
                    <div class="space-y-2">
                      <h3 class="text-sm font-semibold text-white">
                        Variables automatiques de stage
                      </h3>
                      <p class="text-xs leading-5 text-brand-100/75">
                        Ne les remplace pas ici si tu veux garder le modèle dynamique. Sur la fiche publique, elles sont
                        remplacées par le titre, le lieu, les dates, le prix, le niveau ou les infos matériel du stage.
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <code
                      v-for="variable in stageTermsStageVariableExamples"
                      :key="variable"
                      class="rounded-full border border-white/10 bg-brand-900/80 px-2.5 py-1 text-[11px] text-brand-100/80"
                    >{{ '[' + variable + ']' }}</code>
                  </div>
                  <p class="mt-3 text-xs leading-5 text-brand-200/70">
                    Si une information manque dans la fiche stage, la variable reste visible telle quelle pour signaler
                    qu’elle doit être complétée.
                  </p>
                </div>
              </div>

              <textarea
                v-model="form.stageTermsAndConditions"
                rows="18"
                class="w-full rounded-xl border border-brand-800 bg-brand-900/80 px-3 py-3 font-mono text-sm leading-6 text-white focus:border-secondaryBrand-400 focus:outline-none"
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
