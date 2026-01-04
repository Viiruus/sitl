<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

const router = useRouter()
const route = useRoute()
const { clear, fetch } = useUserSession()

const { data, pending, refresh } = await useFetch('/api/guides/me')
const guide = computed(() => data.value?.guide ?? null)
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
        <div class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.4em] text-secondaryBrand-300">
            Tableau de bord guide
          </p>
          <h1 class="mt-4 text-3xl font-semibold">
            Salut {{ guide?.firstName || 'moniteur' }} 👋
          </h1>
          <p class="mt-2 text-brand-100/80">
            Suis tes aventures et prépare tes prochains séjours.
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
                  Tous les champs requis remplis
                </template>
                <template v-else>
                  Manque :
                  <span class="font-medium text-secondaryBrand-200">
                    {{ missingProfileFields.map(formatFieldLabel).join(', ') }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">
            Prochaines étapes
          </p>
          <ul class="mt-4 space-y-4 text-brand-100/80">
            <li>✅ Mets à jour ton <NuxtLink class="text-secondaryBrand-200 underline" to="/moniteurs/profil">profil public</NuxtLink>.</li>
            <li>🔜 Publie tes aventures et dates dès que la section sera disponible.</li>
          </ul>
        </div>
      </main>
    </div>
  </div>
</template>
