<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Grimpeur·euse·s inscrit·e·s',
  description: 'Liste des grimpeur·euse·s inscrit·e·s sur la plateforme.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()

const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)

const { data, pending } = await useFetch('/api/guides/climbers')
const climbers = computed(() => data.value?.climbers ?? [])

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
        <section class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <p class="text-sm uppercase tracking-[0.4em] text-secondaryBrand-300">
            Communauté
          </p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 class="text-3xl font-semibold">
                Grimpeur·euse·s inscrit·e·s
              </h1>
              <p class="mt-2 text-brand-100/80">
                Vue simple de la base des grimpeur·euse·s de la plateforme, avec prénom et nom uniquement.
              </p>
            </div>
            <div class="rounded-2xl bg-brand-900/60 px-5 py-4 text-right ring-1 ring-white/10">
              <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                Total
              </p>
              <p class="mt-2 text-3xl font-semibold">
                {{ climbers.length }}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
          <div v-if="pending" class="text-brand-100/70">
            Chargement des grimpeur·euse·s…
          </div>

          <div v-else-if="!climbers.length" class="text-brand-100/70">
            Aucun·e grimpeur·euse inscrit·e pour le moment.
          </div>

          <ul v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <li
              v-for="climber in climbers"
              :key="climber.id"
              class="rounded-2xl bg-brand-900/60 px-5 py-4 ring-1 ring-white/10"
            >
              <p class="text-base font-medium text-white">
                {{ climber.fullName }}
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>
