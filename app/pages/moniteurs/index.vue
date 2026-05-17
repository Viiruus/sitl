<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Tableau de bord moniteur·ice',
  description: 'Gère tes aventures, sessions et inscriptions.',
  robots: 'noindex, nofollow',
})

const router = useRouter()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { clear, fetch } = useUserSession()

const { data, pending, refresh } = await useFetch('/api/guides/me')
const guide = computed(() => data.value?.guide ?? null)
const { data: aventuresData } = await useFetch('/api/guides/aventures')
const aventures = computed(() => aventuresData.value?.aventures ?? [])
const guideProfilePath = computed(() => {
  const slug = guide.value?.slug
  return slug ? `/moniteurs/${slug}` : null
})
const guideProfileUrl = computed(() => {
  if (!guideProfilePath.value) return null
  const origin = import.meta.client && window.location?.origin
    ? window.location.origin
    : (runtimeConfig.public.publicUrl || 'http://localhost:3000')
  const url = new URL(guideProfilePath.value, origin)
  url.searchParams.set('source', 'qrcode')
  return url.toString()
})
const guideQrFileName = computed(() => {
  const slug = guide.value?.slug
  return slug ? `qr-code-${slug}` : 'qr-code-profil-moniteur'
})
const requiredProfileFields = computed(() => ['firstName', 'lastName', 'baseLocation', 'bio', 'profileImageUrl'] as const)
const missingProfileFields = computed(() => {
  const g = guide.value
  if (!g) return requiredProfileFields.value
  return requiredProfileFields.value.filter((key) => {
    const value = g[key]
    if (typeof value === 'string') {
      return value.trim().length === 0
    }
    return !value
  })
})

const profileComplete = computed(() => {
  const g = guide.value
  if (!g) return false
  return missingProfileFields.value.length === 0
})

const guideNotice = computed(() => route.query.notice)

const clearNotice = async () => {
  if (!guideNotice.value) return
  await router.replace({ query: { ...route.query, notice: undefined } })
}

const hasPublishedAdventure = computed(() =>
  aventures.value.some((a: any) => a?.estPublie),
)

const hasAnySession = computed(() =>
  aventures.value.some((a: any) => (a?.sessions?.length ?? 0) > 0),
)

const formatFieldLabel = (key: (typeof requiredProfileFields.value)[number]) => {
  const labels: Record<(typeof requiredProfileFields.value)[number], string> = {
    firstName: 'Prénom',
    lastName: 'Nom',
    baseLocation: 'Camp de base',
    bio: 'Bio',
    profileImageUrl: 'Photo',
  }
  return labels[key] || key
}

const logout = async () => {
  await clear()
  await fetch()
  router.push('/moniteurs/login')
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="flex-1 space-y-8">
        <div
          v-if="guideNotice === 'guide-only'"
          class="rounded-3xl border border-amber-400/40 bg-amber-500/10 p-6 text-amber-100/90"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-amber-200/80">
                Accès grimpeur·euse
              </p>
              <p class="mt-2 text-lg font-semibold">
                Connecté·e en tant que moniteur·ice
              </p>
              <p class="mt-1 text-sm text-amber-100/80">
                L’espace grimpeur·euse est réservé aux grimpeur·euse·s. Tu peux gérer ton compte depuis ce back-office moniteur·ice·s.
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-amber-300/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100 transition hover:bg-amber-400/20"
              @click="clearNotice"
            >
              J’ai compris
            </button>
          </div>
        </div>

        <div class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.4em] text-secondaryBrand-300">
            Tableau de bord moniteur·ice
          </p>
          <h1 class="mt-4 text-3xl font-semibold">
            Salut {{ guide?.firstName || 'moniteur·ice' }} 👋
          </h1>
          <p class="mt-2 text-brand-100/80">
            Prépare tes prochains stages, suis tes aventures et gère les inscriptions.
          </p>
          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-2xl bg-brand-900/60 p-5 ring-1 ring-white/10">
              <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                Aventures
              </p>
              <p class="mt-2 text-3xl font-semibold">
                {{ guide?.aventuresPubliees ?? '—' }}
              </p>
              <p class="text-sm text-brand-200/70">
                publiées
              </p>
            </div>
            <div class="rounded-2xl bg-brand-900/60 p-5 ring-1 ring-white/10">
              <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                Sessions
              </p>
              <p class="mt-2 text-3xl font-semibold">
                {{ guide?.prochainesSessions ?? '—' }}
              </p>
              <p class="text-sm text-brand-200/70">
                planifiées
              </p>
            </div>
            <div class="rounded-2xl bg-brand-900/60 p-5 ring-1 ring-white/10">
              <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                Profil
              </p>
              <p class="mt-2 text-3xl font-semibold">
                {{ profileComplete ? 'Complet' : 'À compléter' }}
              </p>
              <div class="text-sm text-brand-200/70">
                <template v-if="profileComplete">
                  Ton profil est visible sur le site.
                </template>
                <template v-else>
                  Pour être visible sur le site, renseigne au minimum :
                  <span class="font-medium text-secondaryBrand-200">
                    {{ missingProfileFields.map(formatFieldLabel).join(', ') }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!hasPublishedAdventure || !hasAnySession"
          class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10"
        >
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Prochaines étapes
          </p>
          <ul class="mt-4 space-y-4 text-brand-100/80">
            <li v-if="!hasPublishedAdventure">
              ✅ Crée ta 1ère aventure et publie-la depuis <NuxtLink class="text-secondaryBrand-200 underline" to="/moniteurs/aventures">Mes aventures</NuxtLink>.
            </li>
            <li v-if="!hasAnySession">
              ✅ Planifie une session sur une aventure publiée.
            </li>
          </ul>
        </div>

        <MoniteursGuideProfileQrCard
          v-if="guideProfileUrl"
          :profile-url="guideProfileUrl"
          :guide-name="guide?.fullName"
          :file-name="guideQrFileName"
        />
      </main>
    </div>
  </div>
</template>
