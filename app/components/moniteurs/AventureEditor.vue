<script setup lang="ts">

type StoredImageVariant = {
  url: string
  width: number
  size?: number
}

type AdventureData = {
  slug: string
  estPublie: boolean
  titre: string
  discipline: 'FALAISE' | 'GRANDE_VOIE' | 'BLOC' | 'TRAD' | 'VIA_FERRATA'
  lieuLabel: string
  prixParPersonne: number
  jours: number
  placesMax: number
  sousTitre: string
  transportLabel: string
  niveauMinimum: string
  descriptionCourte: string
  descriptionLongue: string
  ageMin: number | null
  ageMax: number | null
  autonomieMini: string
  coverImageUrl: string
  coverImageVariants?: StoredImageVariant[] | null
  equipementRequis: string[]
  equipementFourni: string[]
  hebergementDetails: string
  inclus: string
  nonInclus: string
  objectifs: string
  prerequis: string[]
  repasLabel: string
  images: {
    url: string
    alt?: string | null
    position?: number | null
    variants?: StoredImageVariant[] | null
  }[]
  programmeJours: {
    id?: number | null
    ordre?: number | null
    titre: string
    description?: string | null
    lieuLabel?: string | null
  }[]
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: AdventureData | null
}>()

const emit = defineEmits<{
  (e: 'created', slug: string): void
}>()

const generatingSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140)

const createList = (list?: string[] | null, atLeastOne = false) => {
  if (list && list.length) {
    return [...list]
  }
  return atLeastOne ? [''] : ['']
}

const createTextList = (value?: string | null) => {
  if (!value) return ['']
  const items = value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((item) => item.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean)
  return items.length ? items : ['']
}

const createProgrammeList = (
  list?: { titre?: string | null; description?: string | null; lieuLabel?: string | null }[] | null,
) => {
  if (list && list.length) {
    return list.map((jour) => ({
      titre: jour?.titre || '',
      description: jour?.description || '',
      lieuLabel: jour?.lieuLabel || '',
    }))
  }
  return [{ titre: '', description: '', lieuLabel: '' }]
}

const form = reactive({
  titre: '',
  discipline: 'FALAISE',
  lieuLabel: '',
  prixParPersonne: '',
  jours: '',
  placesMax: '',
  sousTitre: '',
  transportLabel: '',
  niveauMinimum: '',
  descriptionCourte: '',
  descriptionLongue: '',
  ageMin: '',
  ageMax: '',
  autonomieMini: '',
  coverImageUrl: '',
  equipementRequis: [''],
  equipementFourni: [''],
  hebergementDetails: '',
  inclus: '',
  nonInclus: '',
  objectifs: [''],
  prerequis: [''],
  repasLabel: '',
  programmeJours: [{ titre: '', description: '', lieuLabel: '' }],
})

const currentSlug = ref(props.initialData?.slug || '')
const isPublished = ref(props.initialData?.estPublie ?? false)
const saving = ref(false)
const publishing = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const uploadingCover = ref(false)
const coverUploadError = ref<string | null>(null)
const isClient = ref(false)
const coverImageVariants = ref<StoredImageVariant[]>([])
const galleryImages = reactive<{ url: string; alt: string; variants: StoredImageVariant[] }[]>([
  { url: '', alt: '', variants: [] },
])
const galleryUploadStates = reactive<Record<number, { loading: boolean; error: string | null }>>({})
const ALLOWED_UPLOAD_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

onMounted(() => {
  isClient.value = true
})

const validateUploadFile = (file: File) => {
  if (!ALLOWED_UPLOAD_MIME.includes(file.type)) {
    return 'Format non supporté. Utilise JPG, PNG ou WebP.'
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return 'Image trop lourde. Limite: 5 Mo.'
  }
  return null
}

const normalizeVariants = (variants?: any[] | null): StoredImageVariant[] => {
  if (!Array.isArray(variants)) return []
  return variants
    .map((variant: any) => ({
      url: typeof variant?.url === 'string' ? variant.url.trim() : '',
      width: Number(variant?.width),
      size: Number.isFinite(Number(variant?.size)) ? Number(variant?.size) : undefined,
    }))
    .filter((variant) => isStoredUploadPath(variant.url) && Number.isFinite(variant.width) && variant.width > 0)
    .sort((a, b) => a.width - b.width)
}

const isStoredUploadPath = (value?: string | null) => {
  if (typeof value !== 'string') return false
  const cleaned = value.trim().replace(/^(\.\/)+/, '')
  return cleaned.startsWith('/uploads/') || cleaned.startsWith('uploads/')
}

const slugPreview = computed(() => currentSlug.value || generatingSlug(form.titre))

const resetListIfEmpty = (list: string[]) => {
  if (!list.length) {
    list.push('')
  }
}

watch(
  () => props.initialData,
  (value) => {
    if (!value) return
    currentSlug.value = value.slug
    isPublished.value = value.estPublie
    form.titre = value.titre
    form.discipline = value.discipline
    form.lieuLabel = value.lieuLabel
    form.prixParPersonne = value.prixParPersonne
    form.jours = value.jours
    form.placesMax = value.placesMax
    form.sousTitre = value.sousTitre || ''
    form.transportLabel = value.transportLabel || ''
    form.niveauMinimum = value.niveauMinimum || ''
    form.descriptionCourte = value.descriptionCourte || ''
    form.descriptionLongue = value.descriptionLongue || ''
    form.ageMin = value.ageMin != null ? String(value.ageMin) : ''
    form.ageMax = value.ageMax != null ? String(value.ageMax) : ''
    form.autonomieMini = value.autonomieMini || ''
    form.coverImageUrl = value.coverImageUrl || ''
    coverImageVariants.value = normalizeVariants(value.coverImageVariants || [])
    form.equipementRequis = createList(value.equipementRequis, true)
    form.equipementFourni = createList(value.equipementFourni || null)
    form.hebergementDetails = value.hebergementDetails || ''
    form.inclus = value.inclus || ''
    form.nonInclus = value.nonInclus || ''
    form.objectifs = createTextList(value.objectifs || '')
    form.prerequis = createList(value.prerequis || null)
    form.repasLabel = value.repasLabel || ''
    form.programmeJours = createProgrammeList(value.programmeJours || null)
    if (value.images?.length) {
      galleryImages.splice(
        0,
        galleryImages.length,
        ...value.images
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((img) => ({
            url: img.url || '',
            alt: img.alt || '',
            variants: normalizeVariants(img.variants || []),
          })),
      )
    } else {
      galleryImages.splice(0, galleryImages.length, { url: '', alt: '', variants: [] })
    }
  },
  { immediate: true },
)

const addListItem = (list: string[]) => {
  list.push('')
}

const removeListItem = (list: string[], index: number) => {
  if (list.length === 1) {
    list[0] = ''
    return
  }
  list.splice(index, 1)
}

const addGalleryImage = () => {
  galleryImages.push({ url: '', alt: '', variants: [] })
}

const removeGalleryImage = (index: number) => {
  if (galleryImages.length === 1) {
    galleryImages[0] = { url: '', alt: '', variants: [] }
    return
  }
  galleryImages.splice(index, 1)
}

const addProgrammeDay = () => {
  form.programmeJours.push({ titre: '', description: '', lieuLabel: '' })
}

const removeProgrammeDay = (index: number) => {
  if (form.programmeJours.length === 1) {
    form.programmeJours[0] = { titre: '', description: '', lieuLabel: '' }
    return
  }
  form.programmeJours.splice(index, 1)
}

const toListPayload = (list: string[]) => list.map((item) => item.trim()).filter(Boolean)

const parseNumberField = (value: string | number) => {
  if (typeof value === 'number') return value
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const validateBaseFields = () => {
  if (!form.titre.trim()) {
    throw new Error('Ajoute un titre pour créer ton aventure.')
  }
  if (!form.lieuLabel.trim()) {
    throw new Error('Ajoute un lieu.')
  }
  const priceValue = parseNumberField(form.prixParPersonne)
  if (priceValue == null || priceValue < 0) {
    throw new Error('Indique un prix par personne.')
  }
  const daysValue = parseNumberField(form.jours)
  if (daysValue == null || daysValue < 1) {
    throw new Error('Indique le nombre de jours.')
  }
  const placesValue = parseNumberField(form.placesMax)
  if (placesValue == null || placesValue < 1) {
    throw new Error('Indique le nombre de places.')
  }
}

const ensureAdventureExists = async () => {
  if (currentSlug.value) {
    return currentSlug.value
  }
  validateBaseFields()
  const slugValue = slugPreview.value
  if (!slugValue) {
    throw new Error('Impossible de générer un slug. Vérifie ton titre.')
  }

  const result = await $fetch('/api/guides/aventures', {
    method: 'POST',
    body: {
      titre: form.titre.trim(),
      slug: slugValue,
      discipline: form.discipline,
      lieuLabel: form.lieuLabel.trim(),
      prixParPersonne: parseNumberField(form.prixParPersonne) ?? 0,
      jours: parseNumberField(form.jours) ?? 0,
      placesMax: parseNumberField(form.placesMax) ?? 0,
    },
  })
  currentSlug.value = result.aventure.slug
  isPublished.value = result.aventure.estPublie ?? false
  emit('created', result.aventure.slug)
  return currentSlug.value
}

const buildPayload = (publish: boolean) => ({
  titre: form.titre.trim(),
  discipline: form.discipline as AdventureData['discipline'],
  lieuLabel: form.lieuLabel.trim(),
  prixParPersonne: parseNumberField(form.prixParPersonne) ?? 0,
  jours: parseNumberField(form.jours) ?? 0,
  placesMax: parseNumberField(form.placesMax) ?? 0,
  sousTitre: form.sousTitre.trim(),
  transportLabel: form.transportLabel.trim(),
  niveauMinimum: form.niveauMinimum.trim(),
  descriptionCourte: form.descriptionCourte.trim(),
  descriptionLongue: form.descriptionLongue.trim(),
  ageMin: parseNumberField(form.ageMin),
  ageMax: parseNumberField(form.ageMax),
  autonomieMini: form.autonomieMini.trim(),
  coverImageUrl: form.coverImageUrl.trim() || null,
  coverImageVariants: isStoredUploadPath(form.coverImageUrl)
    ? normalizeVariants(coverImageVariants.value)
    : [],
  equipementRequis: toListPayload(form.equipementRequis),
  equipementFourni: toListPayload(form.equipementFourni),
  hebergementDetails: form.hebergementDetails.trim(),
  inclus: form.inclus.trim(),
  nonInclus: form.nonInclus.trim(),
  objectifs: toListPayload(form.objectifs).join('\n'),
  prerequis: toListPayload(form.prerequis),
  repasLabel: form.repasLabel.trim(),
  programmeJours: form.programmeJours
    .map((jour, index) => {
      const rawTitle = jour.titre.trim()
      const rawDescription = jour.description.trim()
      const rawLieu = jour.lieuLabel.trim()
      const hasContent = rawTitle || rawDescription || rawLieu
      if (!hasContent) return null
      return {
        ordre: index + 1,
        titre: rawTitle || `Jour ${index + 1}`,
        description: rawDescription || undefined,
        lieuLabel: rawLieu || undefined,
      }
    })
    .filter(Boolean),
  estPublie: publish,
  images: galleryImages
    .map((img, index) => ({
      url: img.url.trim(),
      alt: img.alt.trim(),
      position: index,
      variants: isStoredUploadPath(img.url) ? normalizeVariants(img.variants) : [],
    }))
    .filter((img) => img.url),
})

const validatePublish = () => {
  const missing: string[] = []
  if (!form.sousTitre.trim()) missing.push('Sous-titre')
  if (!form.niveauMinimum.trim()) missing.push('Niveau minimum')
  if (!form.descriptionCourte.trim() || form.descriptionCourte.trim().length < 10) missing.push('Description courte')
  if (!form.coverImageUrl.trim()) missing.push('Image de couverture')
  if (!toListPayload(form.equipementRequis).length) missing.push('Équipement requis')
  if (!form.inclus.trim()) missing.push('Inclus')
  if (!form.nonInclus.trim()) missing.push('Non inclus')

  if (missing.length) {
    errorMessage.value = `Complète ces champs avant de publier : ${missing.join(', ')}.`
    return false
  }
  return true
}

const saveDraft = async () => {
  errorMessage.value = null
  successMessage.value = null
  saving.value = true
  try {
    validateBaseFields()
    const slug = await ensureAdventureExists()
    const payload = buildPayload(isPublished.value)
    const result = await $fetch(`/api/guides/aventures/${slug}`, {
      method: 'PUT',
      body: payload,
    })
    isPublished.value = payload.estPublie
    successMessage.value = payload.estPublie ? 'Aventure mise à jour.' : 'Brouillon sauvegardé.'
    if (result?.slug && !currentSlug.value) {
      currentSlug.value = result.slug
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Impossible de sauvegarder.'
  } finally {
    saving.value = false
  }
}

const publishAdventure = async () => {
  errorMessage.value = null
  successMessage.value = null
  if (!validatePublish()) {
    return
  }
  try {
    validateBaseFields()
  } catch (error: any) {
    errorMessage.value = error?.message || 'Complète les informations principales.'
    return
  }
  publishing.value = true
  try {
    const slug = await ensureAdventureExists()
    const payload = buildPayload(true)
    const result = await $fetch(`/api/guides/aventures/${slug}`, {
      method: 'PUT',
      body: payload,
    })
    isPublished.value = true
    successMessage.value = 'Aventure publiée 🎉'
    if (result?.slug) {
      currentSlug.value = result.slug
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Impossible de publier.'
  } finally {
    publishing.value = false
  }
}

const uploadCoverImage = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  coverUploadError.value = null
  const fileError = validateUploadFile(file)
  if (fileError) {
    coverUploadError.value = fileError
    target.value = ''
    return
  }
  uploadingCover.value = true
  try {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('kind', 'cover')
    const response = await $fetch<{ url: string; variants?: StoredImageVariant[] }>('/api/moniteurs/upload', {
      method: 'POST',
      body: formData,
    })
    form.coverImageUrl = response.url
    coverImageVariants.value = normalizeVariants(response.variants || [])
    successMessage.value = 'Image de couverture mise à jour.'
  } catch (error: any) {
    coverUploadError.value = error?.data?.message || 'Échec du téléversement.'
  } finally {
    uploadingCover.value = false
    target.value = ''
  }
}

const uploadGalleryImage = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  galleryUploadStates[index] = galleryUploadStates[index] || { loading: false, error: null }
  galleryUploadStates[index].error = null
  const fileError = validateUploadFile(file)
  if (fileError) {
    galleryUploadStates[index].error = fileError
    target.value = ''
    return
  }
  galleryUploadStates[index].loading = true
  try {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('kind', 'gallery')
    const response = await $fetch<{ url: string; variants?: StoredImageVariant[] }>('/api/moniteurs/upload', {
      method: 'POST',
      body: formData,
    })
    galleryImages[index].url = response.url
    galleryImages[index].variants = normalizeVariants(response.variants || [])
    successMessage.value = 'Photo ajoutée à la galerie.'
  } catch (error: any) {
    galleryUploadStates[index].error = error?.data?.message || 'Échec du téléversement.'
  } finally {
    galleryUploadStates[index].loading = false
    target.value = ''
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-secondaryBrand-300">
          {{ mode === 'create' ? 'Création d’une aventure' : 'Éditeur d’aventure' }}
        </p>
        <h1 class="text-3xl font-semibold">
          {{ form.titre || 'Nouvelle aventure' }}
        </h1>
        <p class="text-sm text-brand-100/70">
          Complète toutes les infos pour rendre ton stage irrésistible.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          :class="isPublished ? 'border-secondaryBrand-400 text-secondaryBrand-200' : 'border-yellow-400/60 text-yellow-200'"
        >
          {{ isPublished ? 'Publié' : 'Brouillon' }}
        </span>
      </div>
    </div>

    <form class="mt-8 space-y-8" @submit.prevent="saveDraft">
      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <h2 class="text-xl font-semibold">Informations principales</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Titre</label>
            <input
              v-model="form.titre"
              type="text"
              placeholder="Ex: Grande voie au Verdon"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Discipline</label>
            <select
              v-model="form.discipline"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            >
              <option value="FALAISE">Falaise</option>
              <option value="GRANDE_VOIE">Grande voie</option>
              <option value="BLOC">Bloc</option>
              <option value="TRAD">Trad</option>
              <option value="VIA_FERRATA">Via ferrata</option>
            </select>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Lieu</label>
            <input
              v-model="form.lieuLabel"
              type="text"
              placeholder="Ex: Presles, Vercors"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Prix par personne (€)</label>
            <input
              v-model="form.prixParPersonne"
              min="0"
              type="number"
              placeholder="Ex: 220"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Durée (jours)</label>
            <input
              v-model="form.jours"
              min="1"
              max="30"
              type="number"
              placeholder="Ex: 2"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Places max</label>
            <input
              v-model="form.placesMax"
              min="1"
              max="20"
              type="number"
              placeholder="Ex: 6"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <h2 class="text-xl font-semibold">Présentation</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <label>Sous-titre</label>
              <span class="text-[10px] text-secondaryBrand-200">Requis pour publier</span>
            </div>
            <input
              v-model="form.sousTitre"
              type="text"
              placeholder="Ex: Deux jours pour progresser en grande voie"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Transport</label>
            <input
              v-model="form.transportLabel"
              type="text"
              placeholder="Ex: Covoiturage depuis Grenoble"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <label>Niveau minimum</label>
              <span class="text-[10px] text-secondaryBrand-200">Requis pour publier</span>
            </div>
            <input
              v-model="form.niveauMinimum"
              type="text"
              placeholder="Ex: 5c en tête"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Âge min</label>
              <input
                v-model="form.ageMin"
                type="number"
                min="0"
                placeholder="Ex: 14"
                class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
              />
            </div>
            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Âge max</label>
              <input
                v-model="form.ageMax"
                type="number"
                min="0"
                placeholder="Ex: 65"
                class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Autonomie</label>
            <input
              v-model="form.autonomieMini"
              type="text"
              placeholder="Ex: Assurage en tête + manip' haut de voie"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
          </div>
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <label>Cover image URL</label>
              <span class="text-[10px] text-secondaryBrand-200">Requis pour publier</span>
            </div>
            <input
              v-model="form.coverImageUrl"
              type="text"
              placeholder="https://…"
              class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
            />
            <p class="text-xs text-brand-200/70">
              Colle l’URL d’une photo ou téléverse une image JPG/PNG/WebP (max 5 Mo). Les variantes optimisées sont générées automatiquement.
            </p>
            <div v-if="isClient" class="space-y-2">
              <label class="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5">
                <span v-if="!uploadingCover">Téléverser une image</span>
                <span v-else class="inline-flex items-center gap-2">
                  <span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Upload en cours…
                </span>
                <input
                  type="file"
                  class="sr-only"
                  accept="image/png,image/jpeg,image/webp"
                  :disabled="uploadingCover"
                  @change="uploadCoverImage"
                />
              </label>
              <p v-if="coverUploadError" class="text-xs text-red-400">
                {{ coverUploadError }}
              </p>
            </div>
            <p v-else class="text-xs text-brand-200/60">
              Téléversement disponible après chargement complet de la page.
            </p>
            <div class="space-y-2">
              <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Aperçu</p>
              <div class="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-brand-900/60">
                <img
                  v-if="form.coverImageUrl"
                  :src="form.coverImageUrl"
                  alt="Image de couverture"
                  class="absolute inset-0 h-full w-full object-cover"
                />
                <div v-else class="absolute inset-0 flex items-center justify-center text-sm text-brand-300/70">
                  Aucune image
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <h2 class="text-xl font-semibold">Descriptions</h2>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/70">
            <label>Description courte</label>
            <span class="text-[10px] text-secondaryBrand-200">Requis pour publier</span>
          </div>
          <textarea
            v-model="form.descriptionCourte"
            rows="3"
            placeholder="Résumé en quelques phrases : ambiance, niveau, objectifs…"
            class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
          />
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Description longue</label>
          <textarea
            v-model="form.descriptionLongue"
            rows="6"
            placeholder="Décris le déroulé, les spots, le rythme des journées, etc."
            class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-200/70">
            <span>Objectifs</span>
            <button type="button" class="text-[10px] font-semibold text-secondaryBrand-300" @click="addListItem(form.objectifs)">
              + Ajouter
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(item, index) in form.objectifs"
              :key="`obj-${index}`"
              class="flex items-center gap-2"
            >
              <input
                v-model="form.objectifs[index]"
                type="text"
                placeholder="Ex: Gagner en autonomie dans les manips de relais"
                class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                @blur="resetListIfEmpty(form.objectifs)"
              />
              <button type="button" class="text-xs text-brand-300 hover:text-red-300" @click="removeListItem(form.objectifs, index)">×</button>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">Programme jour par jour</h2>
            <p class="text-sm text-brand-100/70">
              Optionnel. Décris le déroulé pour aider les grimpeurs à se projeter.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-secondaryBrand-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondaryBrand-100 transition hover:border-secondaryBrand-200"
            @click="addProgrammeDay"
          >
            + Ajouter une journée
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(jour, index) in form.programmeJours"
            :key="`programme-${index}`"
            class="space-y-3 rounded-2xl bg-brand-900/70 p-4 ring-1 ring-white/5"
          >
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <span>Jour {{ index + 1 }}</span>
              <button
                type="button"
                class="text-[10px] font-semibold text-red-200/80 hover:text-red-100"
                @click="removeProgrammeDay(index)"
              >
                Retirer
              </button>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Titre</label>
                <input
                  v-model="jour.titre"
                  type="text"
                  class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                  placeholder="Ex: Approche & premières voies"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Lieu</label>
                <input
                  v-model="jour.lieuLabel"
                  type="text"
                  class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                  placeholder="Ex: Presles"
                />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Description</label>
              <textarea
                v-model="jour.description"
                rows="3"
                class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                placeholder="Ex: Échauffement, choix des voies, coaching technique."
              />
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <h2 class="text-xl font-semibold">Pré-requis & équipement</h2>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <span>Équipement requis</span>
              <span class="text-[10px] uppercase tracking-[0.3em] text-secondaryBrand-200">Requis pour publier</span>
              <button type="button" class="text-[10px] font-semibold text-secondaryBrand-300" @click="addListItem(form.equipementRequis)">
                + Ajouter
              </button>
            </div>
            <div class="space-y-2">
              <div
                v-for="(item, index) in form.equipementRequis"
                :key="`req-${index}`"
                class="flex items-center gap-2"
              >
                <input
                  v-model="form.equipementRequis[index]"
                  type="text"
                  placeholder="Ex: Chaussons, baudrier, casque"
                  class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                  @blur="resetListIfEmpty(form.equipementRequis)"
                />
                <button type="button" class="text-xs text-brand-300 hover:text-red-300" @click="removeListItem(form.equipementRequis, index)">×</button>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <span>Équipement fourni</span>
              <button type="button" class="text-[10px] font-semibold text-secondaryBrand-300" @click="addListItem(form.equipementFourni)">
                + Ajouter
              </button>
            </div>
            <div class="space-y-2">
              <div
                v-for="(item, index) in form.equipementFourni"
                :key="`four-${index}`"
                class="flex items-center gap-2"
              >
                <input
                  v-model="form.equipementFourni[index]"
                  type="text"
                  placeholder="Ex: Corde, dégaines, matériel collectif"
                  class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                  @blur="resetListIfEmpty(form.equipementFourni)"
                />
                <button type="button" class="text-xs text-brand-300 hover:text-red-300" @click="removeListItem(form.equipementFourni, index)">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-200/70">
            <span>Pré-requis</span>
            <button type="button" class="text-[10px] font-semibold text-secondaryBrand-300" @click="addListItem(form.prerequis)">
              + Ajouter
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(item, index) in form.prerequis"
              :key="`pre-${index}`"
              class="flex items-center gap-2"
            >
              <input
                v-model="form.prerequis[index]"
                type="text"
                placeholder="Ex: Être à l’aise en 5c"
                class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                @blur="resetListIfEmpty(form.prerequis)"
              />
              <button type="button" class="text-xs text-brand-300 hover:text-red-300" @click="removeListItem(form.prerequis, index)">×</button>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <h2 class="text-xl font-semibold">Vie sur place</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Hébergement / détails</label>
          <textarea
            v-model="form.hebergementDetails"
            rows="3"
            placeholder="Ex: Gîte partagé à 5 min des falaises"
            class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
          />
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Repas / restauration</label>
          <textarea
            v-model="form.repasLabel"
            rows="3"
            placeholder="Ex: Pique-nique le midi, resto le soir"
            class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
          />
        </div>
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/70">
            <label>Inclus</label>
            <span class="text-[10px] text-secondaryBrand-200">Requis pour publier</span>
          </div>
          <textarea
            v-model="form.inclus"
            rows="3"
            placeholder="Ex: Encadrement + matériel collectif"
            class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
          />
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200/70">
            <label>Non inclus</label>
            <span class="text-[10px] text-secondaryBrand-200">Requis pour publier</span>
          </div>
          <textarea
            v-model="form.nonInclus"
            rows="3"
            placeholder="Ex: Transport, hébergement, repas"
            class="w-full rounded-2xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
          />
        </div>
      </section>

      <section class="space-y-4 rounded-2xl bg-brand-900/50 p-6 ring-1 ring-white/5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">Photos de l’aventure</h2>
            <p class="text-sm text-brand-100/70">Ajoute quelques images pour illustrer le stage.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-secondaryBrand-300/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondaryBrand-100 transition hover:border-secondaryBrand-200"
            @click="addGalleryImage"
          >
            + Ajouter une photo
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(image, index) in galleryImages"
            :key="`gallery-${index}`"
            class="space-y-3 rounded-2xl bg-brand-900/70 p-4 ring-1 ring-white/5"
          >
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-200/70">
              <span>Photo {{ index + 1 }}</span>
              <button
                type="button"
                class="text-[10px] font-semibold text-red-200/80 hover:text-red-100"
                @click="removeGalleryImage(index)"
              >
                Retirer
              </button>
            </div>
            <div class="grid gap-3 md:grid-cols-[2fr_1fr] md:items-start">
              <div class="space-y-2">
                <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">URL de l’image</label>
                <input
                  v-model="image.url"
                  type="text"
                  placeholder="https://…"
                  class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                />
                <div v-if="isClient" class="flex items-center gap-3 text-xs text-brand-200/70">
                  <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/5">
                    <span v-if="!galleryUploadStates[index]?.loading">Téléverser une image</span>
                    <span v-else class="inline-flex items-center gap-2">
                      <span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Upload…
                    </span>
                    <input
                      type="file"
                      class="sr-only"
                      accept="image/png,image/jpeg,image/webp"
                      :disabled="galleryUploadStates[index]?.loading"
                      @change="(event) => uploadGalleryImage(event, index)"
                    />
                  </label>
                  <span v-if="galleryUploadStates[index]?.error" class="text-red-300">
                    {{ galleryUploadStates[index]?.error }}
                  </span>
                </div>
                <p class="text-xs text-brand-200/60">
                  Upload JPG/PNG/WebP, 5 Mo max par image.
                </p>
              </div>
              <div class="space-y-2">
                <label class="text-[11px] uppercase tracking-[0.3em] text-brand-200/70">Texte alternatif</label>
                <input
                  v-model="image.alt"
                  type="text"
                  class="w-full rounded-xl border border-white/10 bg-brand-900/80 px-3 py-2 text-white focus:border-secondaryBrand-400 focus:outline-none"
                  placeholder="Ex: Voie en dalle au coucher du soleil"
                />
              </div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-brand-900/60 p-3">
              <div class="aspect-video overflow-hidden rounded-xl bg-brand-900/40">
                <img
                  v-if="image.url"
                  :src="image.url"
                  class="h-full w-full object-cover"
                  alt="Aperçu"
                />
                <div v-else class="flex h-full items-center justify-center text-sm text-brand-300/70">
                  Aucun visuel
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="submit"
          class="inline-flex items-center gap-2 rounded-2xl bg-secondaryBrand-500/90 px-6 py-3 text-sm font-semibold text-brand-950 shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:opacity-50"
          :disabled="saving || publishing"
        >
          <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
          <span>Enregistrer</span>
        </button>
        <button
          v-if="!isPublished"
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border border-secondaryBrand-400/70 px-6 py-3 text-sm font-semibold text-secondaryBrand-200 transition hover:border-secondaryBrand-200 disabled:opacity-50"
          :disabled="publishing || saving"
          @click="publishAdventure"
        >
          <span v-if="publishing" class="h-4 w-4 animate-spin rounded-full border-2 border-secondaryBrand-200 border-t-transparent" />
          <span>Publier l’aventure</span>
        </button>
      </div>

      <p v-if="successMessage" class="text-sm text-secondaryBrand-200">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>
    </form>
  </div>
</template>
