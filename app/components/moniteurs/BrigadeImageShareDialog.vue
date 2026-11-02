<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue'
import { brigadeFolderNameKey, type BrigadeImageToShare } from '~~/shared/utils/brigade-image-bank'

const props = defineProps<{ image: BrigadeImageToShare; suggestedFolder?: string }>()
const emit = defineEmits<{ close: []; shared: [folderName: string] }>()
const folderChoice = ref('')
const newFolderName = ref(props.suggestedFolder || '')
const alt = ref(props.image.alt || '')
const saving = ref(false)
const saveError = ref('')
const { data, pending, error, refresh } = useFetch('/api/guides/image-bank/folders', { key: 'brigade-image-folders', server: false, lazy: true })
const createFolder = computed(() => folderChoice.value === 'new' || (!pending.value && !error.value && data.value?.folders.length === 0))
watch(() => data.value?.folders, (folders) => {
  if (!folders || folderChoice.value) return
  const match = folders.find(folder => brigadeFolderNameKey(folder.name) === brigadeFolderNameKey(props.suggestedFolder || ''))
  if (match) folderChoice.value = String(match.id)
}, { immediate: true })
const close = () => { if (!saving.value) emit('close') }
const share = async () => {
  if (saving.value) return
  saveError.value = ''
  if (createFolder.value ? newFolderName.value.trim().length < 2 : !folderChoice.value) {
    saveError.value = 'Choisis un dossier ou donne un nom à ton nouveau dossier.'
    return
  }
  saving.value = true
  try {
    const result = await $fetch('/api/guides/image-bank/images', {
      method: 'POST',
      body: {
        url: props.image.url, variants: props.image.variants, alt: alt.value,
        ...(createFolder.value ? { folderName: newFolderName.value } : { folderId: Number(folderChoice.value) }),
      },
    })
    await refresh()
    emit('shared', result.image.folder.name)
  } catch (error: any) {
    saveError.value = error?.data?.statusMessage || error?.data?.message || 'Impossible de partager cette image. Elle reste disponible dans ton aventure.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="true" class="relative z-[70]" @close="close">
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-3 sm:p-6">
        <DialogPanel class="w-full max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900 shadow-2xl sm:p-8">
          <DialogTitle class="text-2xl font-semibold">Partager cette image avec la Brigade ?</DialogTitle>
          <DialogDescription class="mt-3 text-sm leading-6 text-slate-600">Ton image est déjà ajoutée à ton aventure. Tu peux aussi la mettre à disposition des autres moniteur·ice·s.</DialogDescription>
          <img :src="image.variants[0]?.url || image.url" alt="Image à partager" class="mt-5 max-h-52 w-full rounded-2xl bg-white object-contain" />

          <form class="mt-5 space-y-4" @submit.prevent="share">
            <p v-if="pending" role="status" class="text-sm text-slate-600">Chargement des dossiers…</p>
            <div v-else-if="error" role="alert" class="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <p>Impossible de charger les dossiers.</p>
              <button type="button" class="mt-2 underline" @click="refresh()">Réessayer</button>
            </div>
            <template v-else>
              <label v-if="data?.folders.length" class="block text-sm font-semibold">Falaise ou massif
                <select v-model="folderChoice" :disabled="saving" required class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900">
                  <option value="" disabled>Choisir un dossier</option>
                  <option v-for="folder in data.folders" :key="folder.id" :value="String(folder.id)">{{ folder.name }}</option>
                  <option value="new">+ Créer un nouveau dossier</option>
                </select>
              </label>
              <label v-if="createFolder" class="block text-sm font-semibold">Nom de la falaise ou du massif
                <input v-model="newFolderName" :disabled="saving" required minlength="2" maxlength="100" type="text" placeholder="Ex. Les Calanques, Verdon, Les Gaillands…" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900" />
              </label>
              <label class="block text-sm font-semibold">Description de la photo <span class="font-normal text-slate-600">(facultatif)</span>
                <input v-model="alt" :disabled="saving" maxlength="300" type="text" placeholder="Ex. Une cordée dans les dalles des Gaillands" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900" />
              </label>
              <p class="text-xs leading-5 text-slate-600">En ajoutant cette photo, tu autorises les moniteur·ice·s de la Brigade à l’utiliser pour illustrer leurs aventures.</p>
            </template>
            <p v-if="saveError" role="alert" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ saveError }}</p>
            <div class="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
              <button type="submit" :disabled="saving || pending || Boolean(error)" class="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50">{{ saving ? 'Ajout en cours…' : 'Ajouter à la banque' }}</button>
              <button type="button" :disabled="saving" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-50" @click="close">Pas cette fois</button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </div>
  </Dialog>
</template>
