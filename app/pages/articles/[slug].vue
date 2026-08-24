<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { data, error } = await useFetch(() => `/api/articles/${encodeURIComponent(slug.value)}`)

if (error.value || !data.value?.article) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: 'Article introuvable',
  })
}

const article = computed(() => data.value!.article)
const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => {
  try {
    return new URL(`/articles/${article.value.slug}`, resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return `/articles/${article.value.slug}`
  }
})
const coverImageUrl = computed(() => resolveStoredImageSrc(article.value.coverImageUrl, article.value.coverImageVariants) || article.value.coverImageUrl)

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta(() => ({
  title: `${article.value.title} | Brigade du kiff`,
  description: article.value.content.replace(/[#*`>\[\]()!]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
  ogTitle: article.value.title,
  ogImage: coverImageUrl.value,
  ogType: 'article',
  ogUrl: canonicalUrl.value,
  articlePublishedTime: article.value.publishedAt,
  articleModifiedTime: article.value.updatedAt,
  robots: 'index, follow, max-image-preview:large',
}))
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="h-[5.5rem] bg-brand-950">
      <AppHeader compact />
    </div>
    <main>
      <MoniteursArticleDocument
        :title="article.title"
        :cover-image-url="article.coverImageUrl"
        :cover-image-variants="article.coverImageVariants"
        :content="article.content"
        :author-name="article.author.name"
        :author-image-url="article.author.profileImageUrl"
        :date="article.publishedAt"
      />
    </main>
    <AppFooter />
  </div>
</template>
