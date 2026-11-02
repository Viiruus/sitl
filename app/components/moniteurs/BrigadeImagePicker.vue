<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue'
import { brigadeImageThumbnail, type BrigadeBankImage } from '~~/shared/utils/brigade-image-bank'

const emit = defineEmits<{ select: [image: BrigadeBankImage]; close: [] }>()
const folderId = ref('')
const searchInput = ref('')
const search = ref('')
const page = ref(1)
const { data: folderData, error: folderError, refresh: refreshFolders } = useFetch('/api/guides/image-bank/folders', { key: 'brigade-image-folders', server: false, lazy: true })
const query = computed(() => ({
  page: page.value,
  ...(folderId.value ? { folderId: Number(folderId.value) } : {}),
  ...(search.value ? { search: search.value } : {}),
}))
const { data, pending, error, refresh } = useFetch('/api/guides/image-bank/images', { query, server: false, lazy: true })
const findImages = () => { search.value = searchInput.value.trim(); page.value = 1 }
const retry = () => { refresh(); if (folderError.value) refreshFolders() }
</script>

<template>
  <Dialog :open="true" class="relative z-[70]" @close="emit('close')">
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-3 sm:p-6">
        <DialogPanel class="w-full max-w-5xl rounded-3xl border border-white/15 bg-brand-950 p-5 text-white shadow-2xl sm:p-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <DialogTitle class="text-2xl font-semibold">Les images de la Brigade</DialogTitle>
              <DialogDescription class="mt-2 text-sm leading-6 text-brand-100/75">Choisis une photo partagée par les moniteur·ice·s pour illustrer ton aventure.</DialogDescription>
            </div>
            <button type="button" class="shrink-0 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondaryBrand-300" @click="emit('close')">Fermer</button>
          </div>

          <form class="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" @submit.prevent="findImages">
            <label class="text-xs font-semibold text-brand-100/80">Falaise ou massif
              <select v-model="folderId" class="mt-2 w-full rounded-xl border border-white/15 bg-brand-900 px-3 py-2.5 text-sm text-white" @change="page = 1">
                <option value="">Tous les dossiers</option>
                <option v-for="folder in folderData?.folders" :key="folder.id" :value="String(folder.id)">{{ folder.name }} ({{ folder.imageCount }})</option>
              </select>
            </label>
            <label class="text-xs font-semibold text-brand-100/80">Rechercher
              <input v-model="searchInput" type="search" placeholder="Un lieu ou une description" class="mt-2 w-full rounded-xl border border-white/15 bg-brand-900 px-3 py-2.5 text-sm text-white" />
            </label>
            <button type="submit" class="rounded-xl bg-secondaryBrand-300 px-4 py-2.5 text-sm font-semibold text-brand-950 hover:bg-secondaryBrand-200">Rechercher</button>
          </form>

          <p v-if="pending" role="status" class="py-14 text-center text-brand-100/70">Chargement des images…</p>
          <div v-else-if="error || folderError" role="alert" class="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-100">
            <p>Impossible de charger la banque d’images.</p>
            <button type="button" class="mt-3 underline" @click="retry">Réessayer</button>
          </div>
          <div v-else-if="!data?.images.length" class="mt-6 rounded-2xl border border-dashed border-white/20 p-8 text-center text-sm leading-6 text-brand-100/75">
            <p v-if="folderId || search">Aucune photo ne correspond à ta recherche.</p>
            <template v-else>
              <p class="font-semibold text-white">La banque d’images attend ses premières photos.</p>
              <p class="mt-2">Téléverse une image dans ton aventure, puis propose-la à la Brigade dans le dossier de sa falaise ou de son massif.</p>
            </template>
          </div>
          <div v-else class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <button v-for="image in data.images" :key="image.id" type="button" class="group min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 text-left transition hover:border-secondaryBrand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-300" :aria-label="`Utiliser cette image : ${image.alt || image.folder.name}`" @click="emit('select', image)">
              <img :src="brigadeImageThumbnail(image)" :alt="image.alt || image.folder.name" loading="lazy" decoding="async" class="aspect-[4/3] w-full object-cover transition group-hover:opacity-90" />
              <span class="block p-3">
                <span class="block break-words text-sm font-semibold text-secondaryBrand-200">{{ image.folder.name }}</span>
                <span v-if="image.alt" class="mt-1 block line-clamp-2 text-xs leading-5 text-brand-100/80">{{ image.alt }}</span>
                <span class="mt-2 block break-words text-xs text-brand-100/60">Partagée par {{ image.credit }}</span>
                <span class="mt-3 block text-xs font-semibold text-white">Utiliser cette image →</span>
              </span>
            </button>
          </div>
          <nav v-if="!pending && !error && data && data.pageCount > 1" aria-label="Pagination des images" class="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button type="button" :disabled="data.page <= 1" class="rounded-xl border border-white/20 px-4 py-2 disabled:opacity-40" @click="page = data.page - 1">Précédent</button>
            <p class="text-brand-100/70">Page {{ data.page }} sur {{ data.pageCount }}</p>
            <button type="button" :disabled="data.page >= data.pageCount" class="rounded-xl border border-white/20 px-4 py-2 disabled:opacity-40" @click="page = data.page + 1">Suivant</button>
          </nav>
        </DialogPanel>
      </div>
    </div>
  </Dialog>
</template>
