<script setup lang="ts">
const props = withDefaults(defineProps<{
  article: any
  imageSizes?: string
  headingLevel?: 'h2' | 'h3'
  flushAuthor?: boolean
}>(), {
  imageSizes: '(min-width: 768px) 33vw, 100vw',
  headingLevel: 'h3',
  flushAuthor: false,
})

const formatDate = (date: string | Date) => new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(date))
</script>

<template>
  <NuxtLink
    :to="`/articles/${article.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-3xl bg-white text-[#242424] shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-500"
  >
    <div class="aspect-[4/3] overflow-hidden bg-black/5">
      <img
        :src="resolveStoredImageSrc(article.coverImageUrl, article.coverImageVariants) || article.coverImageUrl"
        :srcset="buildStoredSrcset(article.coverImageVariants)"
        :sizes="imageSizes"
        :alt="article.title"
        class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
      >
    </div>
    <div class="flex flex-1 flex-col">
      <div class="flex-1 p-6 sm:p-7">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-secondaryBrand-600">
          {{ formatDate(article.publishedAt) }}
        </p>
        <component :is="headingLevel" class="mt-3 text-2xl font-semibold leading-tight tracking-tight">
          {{ article.title }}
        </component>
        <p class="mt-4 line-clamp-3 text-sm/6 text-[#6b6b6b]">
          {{ article.excerpt }}
        </p>
      </div>
      <div
        class="flex items-center gap-3 border-t border-black/10"
        :class="flushAuthor
          ? 'px-6 py-5 sm:px-7'
          : 'mx-6 mb-6 pt-5 sm:mx-7 sm:mb-7'"
      >
        <img
          v-if="article.author.profileImageUrl"
          :src="resolveStoredImageSrc(article.author.profileImageUrl, article.author.profileImageVariants) || article.author.profileImageUrl"
          :srcset="buildStoredSrcset(article.author.profileImageVariants)"
          sizes="40px"
          :alt="article.author.name"
          class="size-10 rounded-full object-cover"
          loading="lazy"
          decoding="async"
        >
        <span v-else class="flex size-10 items-center justify-center rounded-full bg-[#eeeeeb] text-sm font-semibold">
          {{ article.author.name.slice(0, 1).toUpperCase() }}
        </span>
        <span class="text-sm font-medium">{{ article.author.name }}</span>
        <span class="ml-auto text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
      </div>
    </div>
  </NuxtLink>
</template>
