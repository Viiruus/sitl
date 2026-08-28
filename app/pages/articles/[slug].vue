<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'
import { articleSeoDescription } from '~~/shared/utils/article-content'

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
const siteBaseUrl = computed(() => resolvePublicSiteUrl(runtimeConfig.public.publicUrl))
const canonicalUrl = computed(() => {
  try {
    return new URL(`/articles/${article.value.slug}`, siteBaseUrl.value).toString()
  } catch {
    return `/articles/${article.value.slug}`
  }
})
const coverImageUrl = computed(() => resolveStoredImageSrc(article.value.coverImageUrl, article.value.coverImageVariants) || article.value.coverImageUrl)
const socialImageUrl = computed(() => {
  const image = coverImageUrl.value
  try {
    if (image && !image.startsWith('data:') && !image.startsWith('blob:')) {
      return new URL(image, siteBaseUrl.value).toString()
    }
    return new URL('/images/brigade-du-kiff-falaise-escalade-hd.jpg', siteBaseUrl.value).toString()
  } catch {
    return image || '/images/brigade-du-kiff-falaise-escalade-hd.jpg'
  }
})
const seoTitle = computed(() => article.value.title.trim())
const seoDescription = computed(() =>
  articleSeoDescription(article.value.content)
  || `Découvrez ${article.value.title}, un récit d’escalade partagé par ${article.value.author.name}.`,
)

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => socialImageUrl.value,
  ogImageAlt: () => article.value.title,
  ogSiteName: 'Brigade du Kiff',
  ogType: 'article',
  ogUrl: () => canonicalUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => socialImageUrl.value,
  twitterImageAlt: () => article.value.title,
  articlePublishedTime: () => article.value.publishedAt,
  articleModifiedTime: () => article.value.updatedAt,
  robots: 'index, follow, max-image-preview:large',
})
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
        :author-profile-url="article.author.profileUrl"
        :author-image-url="article.author.profileImageUrl"
        :date="article.publishedAt"
      />
    </main>
    <AppFooter />
  </div>
</template>
