<script setup lang="ts">
definePageMeta({ middleware: 'guide-auth' })

useSeoMeta({
  title: 'Mes articles',
  description: 'Écris et gère tes articles.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()
const [{ data: guideData }, { data: articlesData, pending, refresh }] = await Promise.all([
  useFetch('/api/guides/me'),
  useFetch('/api/guides/articles'),
])

const guide = computed(() => guideData.value?.guide ?? null)
const articles = computed(() => articlesData.value?.articles ?? [])
const actionState = reactive<Record<number, { loading: boolean; error: string | null }>>({})

const stateFor = (id: number) => {
  if (!actionState[id]) actionState[id] = { loading: false, error: null }
  return actionState[id]
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Jamais publié'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}

const changeStatus = async (article: any, isPublished: boolean) => {
  const state = stateFor(article.id)
  if (state.loading) return

  if (!isPublished && typeof window !== 'undefined' && !window.confirm('Dé-publier cet article et le remettre en brouillon ?')) {
    return
  }

  state.loading = true
  state.error = null
  try {
    await $fetch(`/api/guides/articles/${article.id}/status`, {
      method: 'PUT',
      body: { isPublished },
    })
    await refresh()
  } catch (error: any) {
    state.error = error?.data?.message || error?.statusMessage || 'Impossible de modifier la publication.'
  } finally {
    state.loading = false
  }
}

const deleteArticle = async (article: any) => {
  const state = stateFor(article.id)
  if (state.loading) return
  if (typeof window !== 'undefined' && !window.confirm(`Supprimer définitivement « ${article.title} » ?`)) return

  state.loading = true
  state.error = null
  try {
    await $fetch(`/api/guides/articles/${article.id}`, { method: 'DELETE' })
    await refresh()
  } catch (error: any) {
    state.error = error?.data?.message || error?.statusMessage || 'Impossible de supprimer cet article.'
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="min-w-0 flex-1">
        <section class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">Blog</p>
              <h1 class="mt-1 text-3xl font-semibold">Mes articles</h1>
              <p class="mt-2 max-w-xl text-sm text-brand-100/70">Raconte une expérience, partage un conseil ou fais découvrir un terrain de jeu.</p>
            </div>
            <NuxtLink
              to="/moniteurs/articles/nouveau"
              class="inline-flex items-center justify-center rounded-full bg-secondaryBrand-400 px-5 py-2.5 text-sm font-semibold text-brand-950 transition hover:bg-secondaryBrand-300"
            >
              + Écrire un article
            </NuxtLink>
          </div>

          <div v-if="pending" class="mt-8 grid gap-5 md:grid-cols-2">
            <div v-for="item in 4" :key="item" class="h-72 animate-pulse rounded-2xl bg-white/5" />
          </div>

          <div v-else-if="!articles.length" class="mt-8 rounded-2xl border border-dashed border-white/20 px-6 py-14 text-center">
            <p class="text-lg font-semibold">Aucun article pour le moment</p>
            <p class="mt-2 text-sm text-brand-100/70">Ton premier article restera en brouillon tant que tu ne l’auras pas publié.</p>
          </div>

          <div v-else class="mt-8 grid gap-5 md:grid-cols-2">
            <article v-for="article in articles" :key="article.id" class="overflow-hidden rounded-2xl bg-white text-[#242424]">
              <img :src="article.coverImageUrl" :alt="article.title" class="aspect-[16/9] w-full bg-[#f2f2f2] object-cover">
              <div class="p-5">
                <div class="flex items-center justify-between gap-3 font-sans text-xs">
                  <span
                    class="rounded-full px-2.5 py-1 font-semibold"
                    :class="article.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'"
                  >
                    {{ article.isPublished ? 'Publié' : 'Brouillon' }}
                  </span>
                  <span class="text-[#6b6b6b]">Modifié le {{ formatDate(article.updatedAt) }}</span>
                </div>
                <h2 class="article-card-title mt-4 text-2xl font-bold leading-tight">{{ article.title }}</h2>
                <p v-if="article.isPublished" class="mt-2 font-sans text-xs text-[#6b6b6b]">Publié le {{ formatDate(article.publishedAt) }}</p>

                <div class="mt-6 flex flex-wrap gap-2 font-sans text-xs font-semibold">
                  <NuxtLink :to="`/moniteurs/articles/${article.id}`" class="rounded-full border border-[#d6d6d6] px-3.5 py-2 transition hover:bg-[#f7f7f7]">Modifier</NuxtLink>
                  <button
                    type="button"
                    class="rounded-full border border-[#1a8917] px-3.5 py-2 text-[#156d12] transition hover:bg-emerald-50 disabled:opacity-40"
                    :disabled="stateFor(article.id).loading"
                    @click="changeStatus(article, !article.isPublished)"
                  >
                    {{ article.isPublished ? 'Dé-publier' : 'Publier' }}
                  </button>
                  <button
                    type="button"
                    class="ml-auto rounded-full border border-red-200 px-3.5 py-2 text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                    :disabled="stateFor(article.id).loading"
                    @click="deleteArticle(article)"
                  >
                    Supprimer
                  </button>
                </div>
                <p v-if="stateFor(article.id).error" class="mt-3 font-sans text-xs text-red-700">{{ stateFor(article.id).error }}</p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.article-card-title {
  font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
</style>
