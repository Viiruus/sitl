<script setup lang="ts">
const props = defineProps<{ mode: 'create' | 'edit'; stageId?: number }>()
const router = useRouter()
const saving = ref(false)
const loading = ref(props.mode === 'edit')
const error = ref('')
const success = ref('')
const stage = ref<any>(null)
const { data: usersData } = await useFetch('/api/admin/users', { query: { role: 'GUIDE' } })
const guides = computed(() => usersData.value?.users || [])

const form = reactive<any>({
  guideId: '', slug: '', titre: '', sousTitre: '', discipline: 'FALAISE', formule: 'GRIMPE_SEULEMENT',
  disciplinesComplementaires: '', lieuLabel: '', pays: 'France', region: '', jours: 1, placesMax: 6, placesMin: 0,
  niveauMinimum: '', autonomieMini: '', prixParPersonne: 0, devise: 'EUR', inclus: '', nonInclus: '',
  pointsLocaux: '', descriptionCourte: '', descriptionLongue: '', objectifs: '', prerequis: '',
  equipementRequis: '', equipementFourni: '', hebergementLabel: '', hebergementDetails: '', repasLabel: '',
  transportLabel: '', pointRdv: '', latitude: '', longitude: '', langues: '', ageMin: '', ageMax: '',
  coverImageUrl: '', coverImageVariants: '', estPublie: false, images: '[]', programmeJours: '[]',
})
const listKeys = ['disciplinesComplementaires', 'prerequis', 'equipementRequis', 'equipementFourni', 'langues']
const toText = (value: unknown) => Array.isArray(value) ? value.join('\n') : ''
const toList = (value: string) => value.split(/\r?\n|,/).map((item) => item.trim()).filter((item, index, values) => item && values.indexOf(item) === index)
const parseJson = (value: string, label: string, fallback: unknown) => {
  if (!value.trim()) return fallback
  try { return JSON.parse(value) } catch { throw new Error(`Le JSON « ${label} » est invalide.`) }
}
const nullableNumber = (value: unknown) => value === '' || value == null ? null : Number(value)
const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 140)

watch(() => form.titre, (title) => { if (props.mode === 'create' && !form.slug) form.slug = slugify(title) })

const load = async () => {
  if (props.mode !== 'edit' || !props.stageId) return
  loading.value = true
  try {
    const response: any = await $fetch(`/api/admin/stages/${props.stageId}`)
    stage.value = response.stage
    for (const key of Object.keys(form)) if (key in response.stage && !listKeys.includes(key) && !['images', 'programmeJours', 'coverImageVariants'].includes(key)) form[key] = response.stage[key] ?? ''
    for (const key of listKeys) form[key] = toText(response.stage[key])
    form.estPublie = Boolean(response.stage.estPublie)
    form.coverImageVariants = response.stage.coverImageVariants ? JSON.stringify(response.stage.coverImageVariants, null, 2) : ''
    form.images = JSON.stringify((response.stage.images || []).map(({ id, aventureId, createdAt, ...image }: any) => image), null, 2)
    form.programmeJours = JSON.stringify((response.stage.programmeJours || []).map(({ id, aventureId, ...jour }: any) => jour), null, 2)
    buildSessionForms()
  } catch (e: any) { error.value = e?.data?.message || 'Impossible de charger le stage.' }
  finally { loading.value = false }
}

const buildPayload = () => ({
  guideId: Number(form.guideId), slug: form.slug, titre: form.titre, sousTitre: form.sousTitre || null,
  discipline: form.discipline, formule: form.formule, disciplinesComplementaires: toList(form.disciplinesComplementaires),
  lieuLabel: form.lieuLabel, pays: form.pays || null, region: form.region || null, jours: Number(form.jours),
  placesMax: Number(form.placesMax), placesMin: Number(form.placesMin), niveauMinimum: form.niveauMinimum || null,
  autonomieMini: form.autonomieMini || null, prixParPersonne: Number(form.prixParPersonne), devise: form.devise,
  inclus: form.inclus || null, nonInclus: form.nonInclus || null, pointsLocaux: form.pointsLocaux || null,
  descriptionCourte: form.descriptionCourte || null, descriptionLongue: form.descriptionLongue || null,
  objectifs: form.objectifs || null, prerequis: toList(form.prerequis), equipementRequis: toList(form.equipementRequis),
  equipementFourni: toList(form.equipementFourni), hebergementLabel: form.hebergementLabel || null,
  hebergementDetails: form.hebergementDetails || null, repasLabel: form.repasLabel || null,
  transportLabel: form.transportLabel || null, pointRdv: form.pointRdv || null,
  latitude: nullableNumber(form.latitude), longitude: nullableNumber(form.longitude), langues: toList(form.langues),
  ageMin: nullableNumber(form.ageMin), ageMax: nullableNumber(form.ageMax), coverImageUrl: form.coverImageUrl || null,
  coverImageVariants: parseJson(form.coverImageVariants, 'variantes de couverture', null), estPublie: form.estPublie,
  images: parseJson(form.images, 'images', []), programmeJours: parseJson(form.programmeJours, 'programme', []),
})

const save = async () => {
  saving.value = true; error.value = ''; success.value = ''
  try {
    const body = buildPayload()
    const response: any = props.mode === 'create'
      ? await $fetch('/api/admin/stages', { method: 'POST', body })
      : await $fetch(`/api/admin/stages/${props.stageId}`, { method: 'PUT', body })
    if (props.mode === 'create') return router.push(`/admin/stages/${response.stage.id}`)
    success.value = 'Stage mis à jour.'
    await load()
  } catch (e: any) { error.value = e?.data?.message || e?.message || 'Enregistrement impossible.' }
  finally { saving.value = false }
}

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
const datetimeLocal = (value: string | Date) => {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
const sessionForms = reactive<Record<number, any>>({})
const newSession = reactive<any>({ dateDebut: '', dateFin: '', statut: 'OUVERT', placesTotales: 6, prixSpecifique: '' })
const sessionBusy = ref<number | 'new' | null>(null)

function buildSessionForms () {
  for (const key of Object.keys(sessionForms)) delete sessionForms[Number(key)]
  for (const item of stage.value?.sessions || []) sessionForms[item.id] = {
    aventureId: Number(props.stageId), dateDebut: datetimeLocal(item.dateDebut), dateFin: datetimeLocal(item.dateFin),
    statut: item.statut, placesTotales: item.placesTotales, prixSpecifique: item.prixSpecifique ?? '',
  }
  newSession.placesTotales = Number(form.placesMax || 0)
}

const sessionPayload = (value: any) => ({
  aventureId: Number(props.stageId), dateDebut: new Date(value.dateDebut).toISOString(), dateFin: new Date(value.dateFin).toISOString(),
  statut: value.statut, placesTotales: Number(value.placesTotales), prixSpecifique: nullableNumber(value.prixSpecifique),
})
const createSession = async () => {
  sessionBusy.value = 'new'; error.value = ''
  try { await $fetch('/api/admin/sessions', { method: 'POST', body: sessionPayload(newSession) }); newSession.dateDebut = ''; newSession.dateFin = ''; await load(); success.value = 'Session créée.' }
  catch (e: any) { error.value = e?.data?.message || 'Création de la session impossible.' }
  finally { sessionBusy.value = null }
}
const updateSession = async (id: number) => {
  sessionBusy.value = id; error.value = ''
  try { await $fetch(`/api/admin/sessions/${id}`, { method: 'PUT', body: sessionPayload(sessionForms[id]) }); await load(); success.value = 'Session mise à jour.' }
  catch (e: any) { error.value = e?.data?.message || 'Modification impossible.' }
  finally { sessionBusy.value = null }
}
const deleteSession = async (id: number) => {
  if (!window.confirm('Supprimer cette session et toutes ses réservations ?')) return
  sessionBusy.value = id
  try { await $fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' }); await load(); success.value = 'Session supprimée.' }
  catch (e: any) { error.value = e?.data?.message || 'Suppression impossible.' }
  finally { sessionBusy.value = null }
}

await load()
</script>

<template>
  <div v-if="loading" class="text-slate-600">Chargement…</div>
  <form v-else class="space-y-6" @submit.prevent="save">
    <p v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ error }}</p>
    <p v-if="success" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{{ success }}</p>
    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-xl font-semibold">Informations principales</h2><label class="flex items-center gap-2 text-sm"><input v-model="form.estPublie" type="checkbox" class="size-4 accent-secondaryBrand-500" /> Stage publié</label></div>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="text-sm text-slate-700">Moniteur<select v-model.number="form.guideId" required :class="inputClass" class="mt-2"><option value="" disabled>Sélectionner</option><option v-for="guide in guides" :key="guide.id" :value="guide.id">{{ [guide.firstName, guide.lastName].filter(Boolean).join(' ') || guide.email }}</option></select></label>
        <label class="text-sm text-slate-700">Titre<input v-model="form.titre" required :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Slug<input v-model="form.slug" required pattern="[a-z0-9-]+" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Sous-titre<input v-model="form.sousTitre" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Discipline<select v-model="form.discipline" :class="inputClass" class="mt-2"><option v-for="value in ['FALAISE','GRANDE_VOIE','BLOC','TRAD','VIA_FERRATA']" :key="value">{{ value }}</option></select></label>
        <label class="text-sm text-slate-700">Formule<select v-model="form.formule" :class="inputClass" class="mt-2"><option value="GRIMPE_SEULEMENT">Grimpe seulement</option><option value="IMMERSION_COMPLETE">Immersion complète</option></select></label>
        <label class="text-sm text-slate-700">Disciplines complémentaires<textarea v-model="form.disciplinesComplementaires" rows="2" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Lieu<input v-model="form.lieuLabel" required :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Pays<input v-model="form.pays" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Région<input v-model="form.region" :class="inputClass" class="mt-2" /></label>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Tarif, durée et niveau</h2>
      <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label v-for="field in [{k:'jours',l:'Jours',step:'0.5'},{k:'placesMin',l:'Places min',step:'1'},{k:'placesMax',l:'Places max',step:'1'},{k:'prixParPersonne',l:'Prix/personne',step:'1'},{k:'ageMin',l:'Âge min',step:'1'},{k:'ageMax',l:'Âge max',step:'1'}]" :key="field.k" class="text-sm text-slate-700">{{ field.l }}<input v-model.number="form[field.k]" type="number" min="0" :step="field.step" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Devise<input v-model="form.devise" maxlength="3" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Niveau minimum<input v-model="form.niveauMinimum" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Autonomie minimum<input v-model="form.autonomieMini" :class="inputClass" class="mt-2" /></label>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Contenu du stage</h2>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label v-for="field in [{k:'descriptionCourte',l:'Description courte',r:4},{k:'descriptionLongue',l:'Description longue',r:8},{k:'objectifs',l:'Objectifs',r:5},{k:'inclus',l:'Inclus',r:4},{k:'nonInclus',l:'Non inclus',r:4},{k:'pointsLocaux',l:'Points locaux',r:4},{k:'prerequis',l:'Prérequis (une ligne par valeur)',r:4},{k:'equipementRequis',l:'Équipement requis',r:4},{k:'equipementFourni',l:'Équipement fourni',r:4}]" :key="field.k" class="text-sm text-slate-700">{{ field.l }}<textarea v-model="form[field.k]" :rows="field.r" :class="inputClass" class="mt-2" /></label>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Logistique et localisation</h2>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label v-for="field in [{k:'hebergementLabel',l:'Hébergement'},{k:'repasLabel',l:'Repas'},{k:'transportLabel',l:'Transport'},{k:'pointRdv',l:'Point de rendez-vous'},{k:'latitude',l:'Latitude'},{k:'longitude',l:'Longitude'}]" :key="field.k" class="text-sm text-slate-700">{{ field.l }}<input v-model="form[field.k]" :type="['latitude','longitude'].includes(field.k) ? 'number' : 'text'" step="any" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Langues<textarea v-model="form.langues" rows="3" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Détails hébergement<textarea v-model="form.hebergementDetails" rows="3" :class="inputClass" class="mt-2" /></label>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Images et programme</h2>
      <label class="mt-5 block text-sm text-slate-700">Image principale<input v-model="form.coverImageUrl" :class="inputClass" class="mt-2" /></label>
      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <label class="text-sm text-slate-700">Variantes couverture (JSON)<textarea v-model="form.coverImageVariants" rows="12" :class="inputClass" class="mt-2 font-mono text-xs" /></label>
        <label class="text-sm text-slate-700">Galerie (JSON)<textarea v-model="form.images" rows="12" :class="inputClass" class="mt-2 font-mono text-xs" /></label>
        <label class="text-sm text-slate-700">Programme (JSON)<textarea v-model="form.programmeJours" rows="12" :class="inputClass" class="mt-2 font-mono text-xs" /></label>
      </div>
    </section>

    <div class="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur"><NuxtLink to="/admin/stages" class="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</NuxtLink><button type="submit" :disabled="saving" class="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:bg-amber-300 disabled:opacity-50">{{ saving ? 'Enregistrement…' : 'Enregistrer le stage' }}</button></div>
  </form>

  <section v-if="mode === 'edit' && !loading" class="admin-panel mt-8 rounded-3xl p-6">
    <h2 class="text-2xl font-semibold">Sessions</h2>
    <p class="mt-2 text-sm text-slate-600">La suppression d’une session supprime également ses réservations.</p>
    <div class="mt-5 space-y-4">
      <div v-for="item in stage?.sessions || []" :key="item.id" class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.3fr_1.3fr_1fr_.7fr_.8fr_auto] lg:items-end">
        <label class="text-xs text-slate-600">Début<input v-model="sessionForms[item.id].dateDebut" type="datetime-local" :class="inputClass" class="mt-1" /></label>
        <label class="text-xs text-slate-600">Fin<input v-model="sessionForms[item.id].dateFin" type="datetime-local" :class="inputClass" class="mt-1" /></label>
        <label class="text-xs text-slate-600">Statut<select v-model="sessionForms[item.id].statut" :class="inputClass" class="mt-1"><option v-for="value in ['BROUILLON','OUVERT','COMPLET','ANNULE']" :key="value">{{ value }}</option></select></label>
        <label class="text-xs text-slate-600">Places<input v-model.number="sessionForms[item.id].placesTotales" type="number" min="0" :class="inputClass" class="mt-1" /></label>
        <label class="text-xs text-slate-600">Prix spécifique<input v-model.number="sessionForms[item.id].prixSpecifique" type="number" min="0" :class="inputClass" class="mt-1" /></label>
        <div class="flex gap-2"><button type="button" class="rounded-full bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950" @click="updateSession(item.id)">Sauver</button><button type="button" class="rounded-full border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50" @click="deleteSession(item.id)">Supprimer</button></div>
        <p class="text-xs text-slate-500 lg:col-span-6">{{ item.placesReservees }} place(s) réservée(s) · {{ item._count.reservations }} réservation(s)</p>
      </div>
      <p v-if="!stage?.sessions?.length" class="text-sm text-slate-500">Aucune session.</p>
    </div>
    <div class="mt-6 grid gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 lg:grid-cols-[1.3fr_1.3fr_1fr_.7fr_.8fr_auto] lg:items-end">
      <label class="text-xs text-slate-600">Début<input v-model="newSession.dateDebut" type="datetime-local" :class="inputClass" class="mt-1" /></label><label class="text-xs text-slate-600">Fin<input v-model="newSession.dateFin" type="datetime-local" :class="inputClass" class="mt-1" /></label><label class="text-xs text-slate-600">Statut<select v-model="newSession.statut" :class="inputClass" class="mt-1"><option v-for="value in ['BROUILLON','OUVERT','COMPLET','ANNULE']" :key="value">{{ value }}</option></select></label><label class="text-xs text-slate-600">Places<input v-model.number="newSession.placesTotales" type="number" min="0" :class="inputClass" class="mt-1" /></label><label class="text-xs text-slate-600">Prix spécifique<input v-model.number="newSession.prixSpecifique" type="number" min="0" :class="inputClass" class="mt-1" /></label><button type="button" :disabled="sessionBusy === 'new'" class="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-50" @click="createSession">Ajouter</button>
    </div>
  </section>
</template>
