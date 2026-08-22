<script setup lang="ts">
const props = defineProps<{ mode: 'create' | 'edit'; userId?: number }>()
const router = useRouter()
const loading = ref(props.mode === 'edit')
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = reactive<any>({
  email: '', password: '', role: 'CLIMBER', isAdmin: false,
  acquisitionSource: '', firstName: '', lastName: '', birthDate: '', department: '', phoneNumber: '',
  whatsappOptIn: false, profileImageUrl: '', onboarded: false, onboardingStep: 0,
  typesOfClimbing: '', climbsMainly: '', environments: '', autonomy: '', frequency: '', gradeLevel: '',
  preferredClimbingStyle: '', climbingGoal: '', boulderingLocations: '', boulderingGrade: '', belayDevices: '',
  multiAutonomy: '', tradProtections: '', tradMovingBelay: '', tripStyles: '',
  guideGender: '', guideBio: '', baseLocation: '', serviceAreas: '', instagramUrl: '', googleBusinessUrl: '',
  googlePlaceId: '', professionalCardNumber: '', stageTermsAndConditions: '', guideProfileImageUrl: '',
  profileImageVariants: '', isPublic: false,
})

const listFields = ['typesOfClimbing', 'environments', 'autonomy', 'boulderingLocations', 'belayDevices', 'multiAutonomy', 'tradProtections', 'tripStyles']
const toText = (value: unknown) => Array.isArray(value) ? value.join('\n') : ''
const toList = (value: string) => value.split(/\r?\n|,/).map((item) => item.trim()).filter((item, index, values) => item && values.indexOf(item) === index)
const parseJson = (value: string) => {
  if (!value.trim()) return null
  try { return JSON.parse(value) } catch { throw new Error('Le JSON des variantes de photo est invalide.') }
}

const load = async () => {
  if (props.mode !== 'edit' || !props.userId) return
  loading.value = true
  try {
    const response: any = await $fetch(`/api/admin/users/${props.userId}`)
    const user = response.user
    for (const key of Object.keys(form)) if (key in user && !listFields.includes(key)) form[key] = user[key] ?? ''
    for (const key of listFields) form[key] = toText(user[key])
    form.password = ''
    form.isAdmin = Boolean(user.isAdmin)
    form.whatsappOptIn = Boolean(user.whatsappOptIn)
    form.onboarded = Boolean(user.onboarded)
    const guide = user.guideProfile || {}
    form.guideGender = guide.gender || ''
    form.guideBio = guide.bio || ''
    form.baseLocation = guide.baseLocation || ''
    form.serviceAreas = toText(guide.serviceAreas)
    form.instagramUrl = guide.instagramUrl || ''
    form.googleBusinessUrl = guide.googleBusinessUrl || ''
    form.googlePlaceId = guide.googlePlaceId || ''
    form.professionalCardNumber = guide.professionalCardNumber || ''
    form.stageTermsAndConditions = guide.stageTermsAndConditions || ''
    form.guideProfileImageUrl = guide.profileImageUrl || ''
    form.profileImageVariants = guide.profileImageVariants ? JSON.stringify(guide.profileImageVariants, null, 2) : ''
    form.isPublic = Boolean(guide.isPublic)
  } catch (e: any) { error.value = e?.data?.message || 'Impossible de charger ce compte.' }
  finally { loading.value = false }
}

await load()

const payload = () => ({
  email: form.email, password: form.password, role: form.role, isAdmin: form.isAdmin,
  acquisitionSource: form.acquisitionSource || null, firstName: form.firstName || null, lastName: form.lastName || null,
  birthDate: form.birthDate || null, department: form.department || null, phoneNumber: form.phoneNumber || null,
  whatsappOptIn: form.whatsappOptIn, profileImageUrl: form.profileImageUrl || null,
  typesOfClimbing: toList(form.typesOfClimbing), climbsMainly: form.climbsMainly || null,
  environments: toList(form.environments), autonomy: toList(form.autonomy), frequency: form.frequency || null,
  gradeLevel: form.gradeLevel || null, preferredClimbingStyle: form.preferredClimbingStyle || null,
  climbingGoal: form.climbingGoal || null, boulderingLocations: toList(form.boulderingLocations),
  boulderingGrade: form.boulderingGrade || null, belayDevices: toList(form.belayDevices),
  multiAutonomy: toList(form.multiAutonomy), tradProtections: toList(form.tradProtections),
  tradMovingBelay: form.tradMovingBelay || null, tripStyles: toList(form.tripStyles),
  onboarded: form.onboarded, onboardingStep: Number(form.onboardingStep || 0),
  guideProfile: form.role === 'GUIDE' ? {
    gender: form.guideGender || null, bio: form.guideBio || null, baseLocation: form.baseLocation || null,
    serviceAreas: toList(form.serviceAreas), instagramUrl: form.instagramUrl || null,
    googleBusinessUrl: form.googleBusinessUrl || null, googlePlaceId: form.googlePlaceId || null,
    professionalCardNumber: form.professionalCardNumber || null, stageTermsAndConditions: form.stageTermsAndConditions || null,
    profileImageUrl: form.guideProfileImageUrl || null, profileImageVariants: parseJson(form.profileImageVariants),
    isPublic: form.isPublic,
  } : null,
})

const save = async () => {
  saving.value = true; error.value = ''; success.value = ''
  try {
    const body = payload()
    const response: any = props.mode === 'create'
      ? await $fetch('/api/admin/users', { method: 'POST', body })
      : await $fetch(`/api/admin/users/${props.userId}`, { method: 'PUT', body })
    if (props.mode === 'create') return router.push(`/admin/utilisateurs/${response.user.id}`)
    success.value = 'Compte mis à jour.'
  } catch (e: any) { error.value = e?.data?.message || e?.message || 'Enregistrement impossible.' }
  finally { saving.value = false }
}

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
</script>

<template>
  <div v-if="loading" class="text-slate-600">Chargement…</div>
  <form v-else class="space-y-6" @submit.prevent="save">
    <p v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ error }}</p>
    <p v-if="success" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{{ success }}</p>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Compte et droits</h2>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="text-sm text-slate-700">Email<input v-model="form.email" required type="email" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">{{ mode === 'create' ? 'Mot de passe (facultatif)' : 'Nouveau mot de passe (laisser vide pour conserver)' }}<input v-model="form.password" type="password" minlength="6" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Type de compte<select v-model="form.role" :class="inputClass" class="mt-2"><option value="CLIMBER">Grimpeur</option><option value="GUIDE">Moniteur</option></select></label>
        <label class="text-sm text-slate-700">Source d’acquisition<input v-model="form.acquisitionSource" :class="inputClass" class="mt-2" /></label>
      </div>
      <div class="mt-5 flex flex-wrap gap-6"><label class="flex items-center gap-2 text-sm"><input v-model="form.isAdmin" type="checkbox" class="size-4 accent-amber-500" /> Administrateur</label><label class="flex items-center gap-2 text-sm"><input v-model="form.onboarded" type="checkbox" class="size-4 accent-amber-500" /> Onboarding terminé</label><label class="flex items-center gap-2 text-sm">Étape <input v-model.number="form.onboardingStep" type="number" min="0" class="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-900 shadow-sm" /></label></div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Identité et contact</h2>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="text-sm text-slate-700">Prénom<input v-model="form.firstName" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Nom<input v-model="form.lastName" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Date de naissance<input v-model="form.birthDate" type="date" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Département<input v-model="form.department" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Téléphone<input v-model="form.phoneNumber" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">URL photo<input v-model="form.profileImageUrl" :class="inputClass" class="mt-2" /></label>
      </div>
      <label class="mt-5 flex items-center gap-2 text-sm"><input v-model="form.whatsappOptIn" type="checkbox" class="size-4 accent-secondaryBrand-500" /> Accepte les messages WhatsApp</label>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold">Profil grimpe</h2>
      <p class="mt-1 text-xs text-slate-500">Pour les listes, utilise une valeur par ligne.</p>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label v-for="field in [{k:'typesOfClimbing',l:'Types de grimpe'},{k:'environments',l:'Environnements'},{k:'autonomy',l:'Autonomie'},{k:'boulderingLocations',l:'Lieux de bloc'},{k:'belayDevices',l:'Assureurs'},{k:'multiAutonomy',l:'Autonomie grande voie'},{k:'tradProtections',l:'Protections trad'},{k:'tripStyles',l:'Styles de voyage'}]" :key="field.k" class="text-sm text-slate-700">{{ field.l }}<textarea v-model="form[field.k]" rows="3" :class="inputClass" class="mt-2" /></label>
        <label v-for="field in [{k:'climbsMainly',l:'Grimpe principalement'},{k:'frequency',l:'Fréquence'},{k:'gradeLevel',l:'Niveau'},{k:'preferredClimbingStyle',l:'Style préféré'},{k:'boulderingGrade',l:'Niveau bloc'},{k:'tradMovingBelay',l:'Relais mobile trad'}]" :key="field.k" class="text-sm text-slate-700">{{ field.l }}<input v-model="form[field.k]" :class="inputClass" class="mt-2" /></label>
      </div>
      <label class="mt-4 block text-sm text-slate-700">Objectif de grimpe<textarea v-model="form.climbingGoal" rows="4" :class="inputClass" class="mt-2" /></label>
    </section>

    <section v-if="form.role === 'GUIDE'" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between"><h2 class="text-xl font-semibold">Profil moniteur</h2><label class="flex items-center gap-2 text-sm"><input v-model="form.isPublic" type="checkbox" class="size-4 accent-secondaryBrand-500" /> Profil public</label></div>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="text-sm text-slate-700">Genre<select v-model="form.guideGender" :class="inputClass" class="mt-2"><option value="">Non renseigné</option><option value="male">Homme</option><option value="female">Femme</option></select></label>
        <label class="text-sm text-slate-700">Camp de base<input v-model="form.baseLocation" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Zones desservies<textarea v-model="form.serviceAreas" rows="3" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">N° carte professionnelle<input v-model="form.professionalCardNumber" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Instagram<input v-model="form.instagramUrl" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Google Business<input v-model="form.googleBusinessUrl" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">Google Place ID<input v-model="form.googlePlaceId" :class="inputClass" class="mt-2" /></label>
        <label class="text-sm text-slate-700">URL photo moniteur<input v-model="form.guideProfileImageUrl" :class="inputClass" class="mt-2" /></label>
      </div>
      <label class="mt-4 block text-sm text-slate-700">Bio<textarea v-model="form.guideBio" rows="6" :class="inputClass" class="mt-2" /></label>
      <label class="mt-4 block text-sm text-slate-700">CGV des stages<textarea v-model="form.stageTermsAndConditions" rows="8" :class="inputClass" class="mt-2 font-mono text-xs" /></label>
      <label class="mt-4 block text-sm text-slate-700">Variantes de photo (JSON)<textarea v-model="form.profileImageVariants" rows="5" :class="inputClass" class="mt-2 font-mono text-xs" /></label>
    </section>

    <div class="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <NuxtLink to="/admin/utilisateurs" class="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</NuxtLink>
      <button type="submit" :disabled="saving" class="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:bg-amber-300 disabled:opacity-50">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
    </div>
  </form>
</template>
