<script setup lang="ts">
import type { ArticleImageVariant } from '~~/shared/types/article'
import { articleContentToMarkdown, markdownContainsText } from '~~/shared/utils/article-content'

const props = defineProps<{
  mode: 'create' | 'edit'
  article?: any | null
  guide?: any | null
}>()

const emit = defineEmits<{
  (event: 'created', id: number): void
  (event: 'updated'): void
}>()

const form = reactive({
  title: props.article?.title || '',
  coverImageUrl: props.article?.coverImageUrl || '',
  coverImageVariants: (Array.isArray(props.article?.coverImageVariants) ? [...props.article.coverImageVariants] : []) as ArticleImageVariant[],
  content: articleContentToMarkdown(props.article?.content),
})

const saving = ref(false)
const uploadingCover = ref(false)
const uploadingInline = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const previewOpen = ref(false)
const contentTextarea = ref<HTMLTextAreaElement | null>(null)
const inlineFileInput = ref<HTMLInputElement | null>(null)
const imageInsertionRange = reactive({ start: 0, end: 0, description: '' })
const selectionState = reactive({ start: 0, end: 0, text: '' })
const hasSelectedText = computed(() => selectionState.end > selectionState.start && selectionState.text.length > 0)

const { uploadGuideImage } = useGuideImageUpload()

const authorName = computed(() => {
  const author = props.article?.author
  return [author?.firstName || props.guide?.firstName, author?.lastName || props.guide?.lastName]
    .filter(Boolean)
    .join(' ') || 'Moniteur·ice de la Brigade'
})

const authorImageUrl = computed(() =>
  props.article?.author?.guideProfile?.profileImageUrl || props.guide?.profileImageUrl || null,
)

const updateSelectionState = () => {
  const textarea = contentTextarea.value
  if (!textarea) return
  selectionState.start = textarea.selectionStart
  selectionState.end = textarea.selectionEnd
  selectionState.text = form.content.slice(selectionState.start, selectionState.end)
}

const activeEditorRange = () => {
  if (hasSelectedText.value) {
    return { start: selectionState.start, end: selectionState.end }
  }
  const textarea = contentTextarea.value
  const start = textarea?.selectionStart ?? form.content.length
  return { start, end: textarea?.selectionEnd ?? start }
}

const replaceSelection = async (
  replacement: string,
  selectionStart: number,
  selectionEnd: number,
  range = activeEditorRange(),
) => {
  const { start, end } = range
  form.content = `${form.content.slice(0, start)}${replacement}${form.content.slice(end)}`

  await nextTick()
  contentTextarea.value?.focus()
  contentTextarea.value?.setSelectionRange(start + selectionStart, start + selectionEnd)
  updateSelectionState()
}

const wrapSelection = (prefix: string, suffix: string, placeholder: string) => {
  const { start, end } = activeEditorRange()
  const selected = form.content.slice(start, end) || placeholder
  replaceSelection(`${prefix}${selected}${suffix}`, prefix.length, prefix.length + selected.length, { start, end })
}

const prefixSelectedLines = (prefix: string, placeholder: string) => {
  const { start, end } = activeEditorRange()
  const lineStart = form.content.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  const selected = form.content.slice(lineStart, end) || placeholder
  const replacement = selected.split('\n').map((line) => `${prefix}${line}`).join('\n')
  replaceSelection(replacement, prefix.length, replacement.length, { start: lineStart, end })
}

const insertLink = () => {
  const { start, end } = activeEditorRange()
  const label = form.content.slice(start, end) || 'texte du lien'
  const replacement = `[${label}](https://)`
  const urlStart = label.length + 3
  replaceSelection(replacement, urlStart, replacement.length - 1, { start, end })
}

const requestInlineImage = () => {
  const { start, end } = activeEditorRange()
  imageInsertionRange.start = start
  imageInsertionRange.end = end
  imageInsertionRange.description = form.content
    .slice(imageInsertionRange.start, imageInsertionRange.end)
    .replace(/[\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
  inlineFileInput.value?.click()
}

const uploadCover = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const fileError = validateGuideUploadFile(file, 'cover')
  if (fileError) {
    errorMessage.value = fileError
    return
  }

  errorMessage.value = null
  uploadingCover.value = true
  try {
    const uploaded = await uploadGuideImage({ file, kind: 'cover' })
    form.coverImageUrl = uploaded.url
    form.coverImageVariants = uploaded.variants
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Impossible de téléverser cette photo.'
  } finally {
    uploadingCover.value = false
  }
}

const uploadInlineImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const fileError = validateGuideUploadFile(file, 'gallery')
  if (fileError) {
    errorMessage.value = fileError
    return
  }

  errorMessage.value = null
  uploadingInline.value = true
  try {
    const uploaded = await uploadGuideImage({ file, kind: 'gallery' })
    const before = form.content.slice(0, imageInsertionRange.start)
    const after = form.content.slice(imageInsertionRange.end)
    const leadingBreak = before && !before.endsWith('\n\n') ? '\n\n' : ''
    const trailingBreak = after && !after.startsWith('\n\n') ? '\n\n' : ''
    const description = imageInsertionRange.description || 'Description de la photo'
    const markdown = `${leadingBreak}![${description}](${uploaded.url})${trailingBreak}`
    form.content = `${before}${markdown}${after}`

    await nextTick()
    const altStart = before.length + leadingBreak.length + 2
    contentTextarea.value?.focus()
    contentTextarea.value?.setSelectionRange(altStart, altStart + description.length)
    updateSelectionState()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Impossible de téléverser cette photo.'
  } finally {
    uploadingInline.value = false
  }
}

const payload = () => ({
  title: form.title.trim(),
  coverImageUrl: form.coverImageUrl,
  coverImageVariants: form.coverImageVariants,
  content: form.content.trim(),
})

const validate = () => {
  if (form.title.trim().length < 3) return 'Ajoute un titre d’au moins 3 caractères.'
  if (!form.coverImageUrl) return 'Ajoute la photo d’en-tête de l’article.'
  if (!markdownContainsText(form.content)) return 'Écris du contenu texte dans ton article.'
  return null
}

const save = async () => {
  errorMessage.value = validate()
  successMessage.value = null
  if (errorMessage.value) return

  saving.value = true
  try {
    if (props.mode === 'create') {
      const response = await $fetch<{ article: { id: number } }>('/api/guides/articles', {
        method: 'POST',
        body: payload(),
      })
      emit('created', response.article.id)
      return
    }

    await $fetch(`/api/guides/articles/${props.article.id}`, {
      method: 'PUT',
      body: payload(),
    })
    successMessage.value = 'Brouillon Markdown enregistré.'
    emit('updated')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.statusMessage || 'Impossible d’enregistrer l’article.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-secondaryBrand-300">Éditeur Markdown</p>
        <h1 class="mt-1 text-2xl font-semibold text-white sm:text-3xl">
          {{ mode === 'create' ? 'Écrire un article' : 'Modifier l’article' }}
        </h1>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          @click="previewOpen = !previewOpen"
        >
          {{ previewOpen ? 'Revenir au Markdown' : 'Voir l’aperçu' }}
        </button>
        <button
          type="button"
          class="rounded-full bg-secondaryBrand-400 px-5 py-2.5 text-sm font-semibold text-brand-950 transition hover:bg-secondaryBrand-300 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="saving || uploadingCover || uploadingInline"
          @click="save"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer le brouillon' }}
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="mb-5 rounded-xl bg-red-950/60 px-4 py-3 text-sm text-red-100 ring-1 ring-red-400/30">
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="mb-5 rounded-xl bg-emerald-950/60 px-4 py-3 text-sm text-emerald-100 ring-1 ring-emerald-400/30">
      {{ successMessage }}
    </p>

    <MoniteursArticleDocument
      v-if="previewOpen"
      class="overflow-hidden rounded-2xl"
      :title="form.title"
      :cover-image-url="form.coverImageUrl"
      :cover-image-variants="form.coverImageVariants"
      :content="form.content"
      :author-name="authorName"
      :author-image-url="authorImageUrl"
      :date="article?.publishedAt || article?.updatedAt"
    />

    <div v-else class="overflow-hidden rounded-2xl bg-white text-[#242424] shadow-2xl shadow-black/20">
      <div class="mx-auto max-w-[920px] px-6 py-10 sm:px-12 sm:py-14">
        <label class="block">
          <span class="sr-only">Titre de l’article</span>
          <textarea
            v-model="form.title"
            rows="2"
            maxlength="180"
            placeholder="Titre de l’article"
            class="article-title w-full resize-none border-0 bg-transparent text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#242424] outline-none placeholder:text-[#b3b3b1] sm:text-6xl"
          />
        </label>

        <div class="mt-10">
          <div v-if="form.coverImageUrl" class="group relative">
            <img :src="form.coverImageUrl" :alt="form.title" class="aspect-[16/9] w-full object-cover">
            <label class="absolute inset-x-4 bottom-4 flex cursor-pointer justify-center rounded-full bg-white/95 px-4 py-2 text-sm font-semibold shadow-lg transition hover:bg-white">
              {{ uploadingCover ? 'Téléversement…' : 'Changer la photo d’en-tête' }}
              <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="uploadingCover" @change="uploadCover">
            </label>
          </div>
          <label v-else class="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-[#d6d6d6] bg-[#fafafa] text-center transition hover:border-[#8a8a8a]">
            <span class="text-4xl text-[#6b6b6b]">＋</span>
            <span class="font-sans text-sm font-semibold">{{ uploadingCover ? 'Téléversement…' : 'Ajouter la photo d’en-tête obligatoire' }}</span>
            <span class="font-sans text-xs text-[#6b6b6b]">JPG, PNG ou WebP</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="uploadingCover" @change="uploadCover">
          </label>
        </div>

        <section class="relative mt-12 overflow-visible rounded-xl border border-[#d6d6d6] bg-white">
          <div class="flex flex-wrap items-center gap-1 border-b border-[#e8e8e8] bg-[#fafafa] p-2 font-sans text-sm">
            <button type="button" class="markdown-tool font-bold" title="Intertitre" @mousedown.prevent="prefixSelectedLines('## ', 'Intertitre')">H2</button>
            <button type="button" class="markdown-tool font-bold" title="Gras" @mousedown.prevent="wrapSelection('**', '**', 'texte en gras')">B</button>
            <button type="button" class="markdown-tool italic" title="Italique" @mousedown.prevent="wrapSelection('*', '*', 'texte en italique')">I</button>
            <button type="button" class="markdown-tool" title="Citation" @mousedown.prevent="prefixSelectedLines('> ', 'Citation')">❝</button>
            <button type="button" class="markdown-tool" title="Liste à puces" @mousedown.prevent="prefixSelectedLines('- ', 'Élément de liste')">• Liste</button>
            <button type="button" class="markdown-tool" title="Ajouter un lien" @mousedown.prevent="insertLink">Lien</button>
            <button
              type="button"
              class="ml-auto rounded-lg bg-[#1a8917] px-3 py-2 font-semibold text-white transition hover:bg-[#156d12] disabled:opacity-40"
              :disabled="uploadingInline"
              @mousedown.prevent="requestInlineImage"
            >
              {{ uploadingInline ? 'Téléversement…' : '+ Photo au curseur' }}
            </button>
          </div>

          <div v-if="hasSelectedText" class="selection-toolbar sticky top-0 z-30" aria-live="polite">
            <span class="selection-label">Texte sélectionné</span>
            <button type="button" class="selection-action font-bold" title="Intertitre" @mousedown.prevent="prefixSelectedLines('## ', 'Intertitre')">H2</button>
            <button type="button" class="selection-action font-bold" title="Gras" @mousedown.prevent="wrapSelection('**', '**', 'texte en gras')">B</button>
            <button type="button" class="selection-action italic" title="Italique" @mousedown.prevent="wrapSelection('*', '*', 'texte en italique')">I</button>
            <button type="button" class="selection-action" title="Ajouter un lien" @mousedown.prevent="insertLink">Lien</button>
            <button
              type="button"
              class="selection-action selection-photo"
              title="Remplacer la sélection par une photo et utiliser ce texte comme description"
              :disabled="uploadingInline"
              @mousedown.prevent="requestInlineImage"
            >
              {{ uploadingInline ? 'Téléversement…' : 'Photo' }}
            </button>
          </div>

          <textarea
            ref="contentTextarea"
            v-model="form.content"
            rows="30"
            maxlength="200000"
            spellcheck="true"
            placeholder="Écris ton article en Markdown…\n\n## Un intertitre\n\nTon histoire commence ici."
            class="min-h-[620px] w-full resize-y border-0 bg-white px-5 py-6 font-mono text-[16px] leading-7 text-[#242424] outline-none placeholder:text-[#a3a3a3] sm:px-7"
            @select="updateSelectionState"
            @mouseup="updateSelectionState"
            @keyup="updateSelectionState"
            @click="updateSelectionState"
          />
          <div class="flex flex-col gap-1 border-t border-[#e8e8e8] bg-[#fafafa] px-4 py-3 font-sans text-xs text-[#6b6b6b] sm:flex-row sm:items-center sm:justify-between">
            <span>Sélectionne du texte pour afficher les options rapides, ou place simplement le curseur avant d’ajouter une photo.</span>
            <span>{{ form.content.length.toLocaleString('fr-FR') }} caractères</span>
          </div>
        </section>

        <input ref="inlineFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="uploadingInline" @change="uploadInlineImage">
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-title {
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.markdown-tool {
  border-radius: 0.5rem;
  padding: 0.5rem 0.7rem;
  color: #3f3f3f;
  transition: background-color 150ms ease;
}

.markdown-tool:hover {
  background: #eaeaea;
}

.selection-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  border-bottom: 1px solid #3f3f3f;
  background: #111111 !important;
  padding: 0.6rem 0.75rem;
  color: #ffffff !important;
}

.selection-label {
  margin-right: 0.35rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #d4d4d4 !important;
  text-transform: uppercase;
}

.selection-action {
  position: relative;
  z-index: 1;
  cursor: pointer;
  border: 1px solid #525252;
  border-radius: 9999px;
  background: #262626 !important;
  padding: 0.4rem 0.75rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.82rem;
  color: #ffffff !important;
  pointer-events: auto;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.selection-action:hover {
  border-color: #a3a3a3;
  background: #404040 !important;
}

.selection-photo {
  margin-left: auto;
  border-color: #f2b94b;
  color: #f8cf78 !important;
}
</style>
