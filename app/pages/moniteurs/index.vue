<script setup lang="ts">
import GuideShell from '~/components/moniteurs/GuideShell.vue'
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
  <GuideShell :guide="guide" :current-path="route.path" @logout="logout">
    <div
      v-if="guideNotice === 'guide-only'"
      class="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-700"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-amber-700">
            Accès grimpeur·euse
          </p>
          <p class="mt-2 text-lg font-semibold">
            Connecté·e en tant que moniteur·ice
          </p>
          <p class="mt-1 text-sm text-amber-700">
            L’espace grimpeur·euse est réservé aux grimpeur·euse·s. Tu peux gérer ton compte depuis ce back-office moniteur·ice·s.
          </p>
        </div>
        <button
          type="button"
          class="rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 transition hover:bg-amber-50"
          @click="clearNotice"
        >
          J’ai compris
        </button>
      </div>
    </div>

    <div class="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <p class="text-sm uppercase tracking-[0.4em] text-amber-700">
        Tableau de bord moniteur·ice
      </p>
      <h1 class="mt-4 text-3xl font-semibold">
        Salut {{ guide?.firstName || 'moniteur·ice' }} 👋
      </h1>
      <p class="mt-2 text-slate-600">
        Prépare tes prochains stages, suis tes aventures et gère les inscriptions.
      </p>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
            Aventures
          </p>
          <p class="mt-2 text-3xl font-semibold">
            {{ guide?.aventuresPubliees ?? '—' }}
          </p>
          <p class="text-sm text-slate-500">
            publiées
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
            Sessions
          </p>
          <p class="mt-2 text-3xl font-semibold">
            {{ guide?.prochainesSessions ?? '—' }}
          </p>
          <p class="text-sm text-slate-500">
            planifiées
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
            Profil
          </p>
          <p class="mt-2 text-3xl font-semibold">
            {{ profileComplete ? 'Complet' : 'À compléter' }}
          </p>
          <div class="text-sm text-slate-500">
            <template v-if="profileComplete">
              Ton profil est visible sur le site.
            </template>
            <template v-else>
              Pour être visible sur le site, renseigne au minimum :
              <span class="font-medium text-amber-700">
                {{ missingProfileFields.map(formatFieldLabel).join(', ') }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!hasPublishedAdventure || !hasAnySession"
      class="rounded-3xl bg-white p-8 ring-1 ring-slate-200"
    >
      <p class="text-sm uppercase tracking-[0.3em] text-amber-700">
        Prochaines étapes
      </p>
      <ul class="mt-4 space-y-4 text-slate-600">
        <li v-if="!hasPublishedAdventure">
          ✅ Crée ta 1ère aventure et publie-la depuis <NuxtLink class="text-amber-700 underline" to="/moniteurs/aventures">Mes aventures</NuxtLink>.
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
  </GuideShell>
</template>
