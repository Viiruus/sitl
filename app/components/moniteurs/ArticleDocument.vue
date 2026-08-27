<script setup lang="ts">
import type { ArticleImageVariant } from '~~/shared/types/article'
import { renderArticleMarkdown } from '~/utils/article-markdown'

const props = defineProps<{
  title: string
  coverImageUrl: string
  coverImageVariants?: ArticleImageVariant[] | null
  content: string
  authorName: string
  authorProfileUrl?: string | null
  authorImageUrl?: string | null
  date?: string | Date | null
}>()

const imageSrcset = (variants?: ArticleImageVariant[] | null) => {
  if (!variants?.length) return undefined
  return variants
    .filter((variant) => variant?.url && variant?.width)
    .sort((a, b) => a.width - b.width)
    .map((variant) => `${variant.url} ${variant.width}w`)
    .join(', ')
}

const formattedDate = computed(() => {
  if (!props.date) return null
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(props.date))
})

const renderedContent = computed(() => renderArticleMarkdown(props.content))
</script>

<template>
  <article class="article-document min-h-full bg-white text-[#242424]">
    <header class="mx-auto max-w-[760px] px-6 pb-10 pt-14 sm:px-10 sm:pt-20">
      <h1 class="article-title text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-6xl">
        {{ title || 'Titre de l’article' }}
      </h1>

      <div class="mt-8 flex items-center gap-3">
        <img
          v-if="authorImageUrl"
          :src="authorImageUrl"
          :alt="authorName"
          class="h-11 w-11 rounded-full object-cover"
        >
        <div v-else class="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-sm font-semibold">
          {{ authorName.slice(0, 1).toUpperCase() }}
        </div>
        <div class="font-sans text-sm leading-5">
          <NuxtLink
            v-if="authorProfileUrl"
            :to="authorProfileUrl"
            class="font-medium text-[#242424] underline decoration-transparent underline-offset-4 transition hover:decoration-[#f59e0b] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
          >
            {{ authorName }}
          </NuxtLink>
          <p v-else class="font-medium text-[#242424]">{{ authorName }}</p>
          <p v-if="formattedDate" class="text-[#6b6b6b]">{{ formattedDate }}</p>
          <p v-else class="text-[#6b6b6b]">Brouillon</p>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-[1120px] px-4 sm:px-8">
      <img
        v-if="coverImageUrl"
        :src="coverImageUrl"
        :srcset="imageSrcset(coverImageVariants)"
        sizes="(max-width: 1120px) 100vw, 1120px"
        :alt="title"
        class="aspect-[16/9] w-full bg-[#f2f2f2] object-cover"
      >
      <div v-else class="flex aspect-[16/9] items-center justify-center bg-[#f2f2f2] font-sans text-sm text-[#6b6b6b]">
        La photo d’en-tête apparaîtra ici
      </div>
    </div>

    <!-- The renderer escapes raw HTML and filters every link/image URL before this is injected. -->
    <div
      class="article-body mx-auto max-w-[680px] px-6 pb-24 pt-12 sm:px-8 sm:pt-16"
      v-html="renderedContent"
    />
  </article>
</template>

<style scoped>
.article-title {
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.article-body {
  font-family: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
}

.article-body :deep(h1) {
  margin: 3.5rem 0 1.25rem;
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 2.25rem;
  font-weight: 750;
  line-height: 1.16;
  letter-spacing: -0.025em;
}

.article-body :deep(h2) {
  margin: 3rem 0 1rem;
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1.875rem;
  font-weight: 750;
  line-height: 1.22;
  letter-spacing: -0.02em;
}

.article-body :deep(h3) {
  margin: 2.5rem 0 0.85rem;
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.3;
}

.article-body :deep(p),
.article-body :deep(li) {
  font-size: 21px;
  line-height: 1.58;
  letter-spacing: -0.003em;
}

.article-body :deep(p) {
  margin-bottom: 2rem;
}

.article-body :deep(strong) {
  font-weight: 700;
}

.article-body :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.article-body :deep(blockquote) {
  margin: 2.5rem 0;
  border-left: 3px solid #242424;
  padding-left: 1.5rem;
  font-style: italic;
}

.article-body :deep(blockquote:has(a[href^="/moniteurs/"])) {
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 1rem;
  background: #fffbeb;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 12px 30px rgb(120 53 15 / 8%);
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-style: normal;
}

.article-body :deep(blockquote:has(a[href^="/moniteurs/"]) p) {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
}

.article-body :deep(blockquote:has(a[href^="/moniteurs/"]) p + p) {
  margin-top: 0.55rem;
}

.article-body :deep(blockquote:has(a[href^="/moniteurs/"]) a) {
  font-weight: 700;
  text-decoration-color: #f59e0b;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 0 0 2rem 1.75rem;
}

.article-body :deep(ul) {
  list-style: disc;
}

.article-body :deep(ol) {
  list-style: decimal;
}

.article-body :deep(li) {
  margin: 0.45rem 0;
  padding-left: 0.35rem;
}

.article-body :deep(img) {
  display: block;
  width: calc(100% + 8rem);
  max-width: none;
  margin: 3rem -4rem;
  background: #f2f2f2;
  object-fit: cover;
}

.article-body :deep(hr) {
  width: 7rem;
  margin: 3.5rem auto;
  border: 0;
  text-align: center;
}

.article-body :deep(hr)::after {
  content: "···";
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.45em;
}

.article-body :deep(code) {
  border-radius: 0.25rem;
  background: #f2f2f2;
  padding: 0.12rem 0.3rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82em;
}

.article-body :deep(pre) {
  margin: 2rem 0;
  overflow-x: auto;
  border-radius: 0.5rem;
  background: #f2f2f2;
  padding: 1.25rem;
}

.article-body :deep(pre code) {
  padding: 0;
}

@media (max-width: 767px) {
  .article-body :deep(img) {
    width: calc(100% + 1rem);
    margin-right: -0.5rem;
    margin-left: -0.5rem;
  }
}
</style>
