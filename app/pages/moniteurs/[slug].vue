<template>
  <div class="relative isolate min-h-screen overflow-hidden bg-brand-950 text-white">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <img
        :src="heroBackground"
        :srcset="heroBackgroundSrcset"
        alt=""
        class="h-full w-full object-cover opacity-25"
        decoding="async"
        sizes="100vw"
        loading="eager"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-950/90 to-brand-950" />
      <svg
        class="absolute top-0 left-[max(50%,25rem)] h-[48rem] w-[90rem] -translate-x-1/2 mask-[radial-gradient(64rem_64rem_at_top,transparent_5%,black)] stroke-brand-800/70"
        aria-hidden="true"
      >
        <defs>
          <pattern id="moniteur-grid" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" class="overflow-visible fill-brand-900/40">
          <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" stroke-width="0" />
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#moniteur-grid)" />
      </svg>
    </div>

    <div class="relative z-10 flex min-h-screen flex-col pt-24 sm:pt-32">
      <AppHeader />

      <main class="flex-1">
        <section class="px-6 py-24 sm:py-20 lg:px-0">

          <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
          <div class="grid grid-cols-1 gap-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div class="order-2 lg:order-1 lg:pr-4">
              <div class="lg:max-w-lg">
                <div>
                  <h1 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                    {{ moniteurName || 'Moniteur local' }}
                  </h1>
                  <button
                    type="button"
                    class="group mt-4 inline-flex items-start gap-x-2.5 rounded-md border border-white/10 bg-brand-950/55 px-3.5 py-2.5 text-left text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/5 backdrop-blur transition hover:border-white/20 hover:bg-brand-900/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-300 lg:hidden"
                    @click="handleGuideContactClick"
                  >
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[#25D366] text-brand-950 shadow-sm shadow-[#25D366]/20">
                      <svg class="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                        <path
                          d="M16 3C9.4 3 4 8.2 4 14.7c0 2.4.7 4.6 2 6.5L4 29l8-1.8c1.3.4 2.7.6 4 .6 6.6 0 12-5.2 12-11.7C28 8.2 22.6 3 16 3Zm0 2c5.5 0 10 4.3 10 9.7S21.5 24.4 16 24.4c-1.3 0-2.5-.2-3.7-.7l-.8-.3-.8.2-3.9.9 1.1-3.3.2-.7-.5-.6c-1.1-1.6-1.6-3.4-1.6-5.3C6 9.3 10.5 5 16 5Zm5.2 10.9c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.2.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.3-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.3 5 4.5.7.3 1.2.5 1.6.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.1-.5-.2Z"
                        />
                      </svg>
                    </span>
                    <span class="text-left leading-tight">Contacter {{ moniteurContactFirstName }} pour un projet sur mesure</span>
                  </button>
                </div>
                <div class="mt-6 max-w-xl text-sm/7 text-gray-300 sm:text-base/8">
                  <p class="whitespace-pre-line">
                    {{ moniteurBioText }}
                  </p>
                  <button
                    v-if="moniteurHasLongBio"
                    type="button"
                    class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200 transition hover:text-secondaryBrand-100"
                    @click="showFullBio = !showFullBio"
                  >
                    {{ showFullBio ? 'Voir moins' : 'Voir plus' }}
                    <svg
                      class="h-4 w-4 transition"
                      :class="showFullBio ? 'rotate-180' : ''"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
                <div class="mt-8 flex flex-wrap gap-3">
                  <span
                    v-for="discipline in disciplineChips"
                    :key="discipline.value"
                    class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondaryBrand-100 ring-1 ring-secondaryBrand-300/40"
                  >
                    <img
                      :src="iconPathForDiscipline(discipline.value)"
                      :alt="discipline.label"
                      class="h-12 w-12 object-contain"
                    />
                    {{ discipline.label }}
                  </span>
                </div>
                <div class="mt-10 max-w-xl text-base/7 text-gray-300 lg:max-w-lg">
                  <ul role="list" class="space-y-8 text-gray-300">
                    <li
                      v-for="feature in featureList"
                      :key="feature.title"
                      class="flex gap-x-3"
                    >
                      <component :is="feature.icon" class="mt-1 size-5 flex-none text-secondaryBrand-300" aria-hidden="true" />
                      <span>
                        <strong class="font-semibold text-white">{{ feature.title }}.</strong>
                        {{ feature.description }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="order-1 lg:order-2 -mt-16 lg:mt-0 lg:sticky lg:top-4 lg:justify-self-end">
              <button
                type="button"
                class="group mb-4 hidden items-center gap-x-2.5 rounded-md border border-white/10 bg-brand-950/55 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/5 backdrop-blur transition hover:border-white/20 hover:bg-brand-900/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-300 lg:inline-flex"
                @click="handleGuideContactClick"
              >
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[#25D366] text-brand-950 shadow-sm shadow-[#25D366]/20">
                  <svg class="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                    <path
                      d="M16 3C9.4 3 4 8.2 4 14.7c0 2.4.7 4.6 2 6.5L4 29l8-1.8c1.3.4 2.7.6 4 .6 6.6 0 12-5.2 12-11.7C28 8.2 22.6 3 16 3Zm0 2c5.5 0 10 4.3 10 9.7S21.5 24.4 16 24.4c-1.3 0-2.5-.2-3.7-.7l-.8-.3-.8.2-3.9.9 1.1-3.3.2-.7-.5-.6c-1.1-1.6-1.6-3.4-1.6-5.3C6 9.3 10.5 5 16 5Zm5.2 10.9c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.2.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.3-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.3 5 4.5.7.3 1.2.5 1.6.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.1-.5-.2Z"
                    />
                  </svg>
                </span>
                <span>Contacter {{ moniteurContactFirstName }} pour un projet sur mesure</span>
              </button>
              <div class="rounded-3xl bg-white/5 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 lg:max-w-[34rem] xl:max-w-[36rem]">
                <img
                  class="w-full max-h-[44rem] rounded-2xl bg-gray-800 object-cover"
                  :src="moniteurPortrait"
                  :srcset="moniteurPortraitSrcset"
                  :alt="seoTitle"
                  decoding="async"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  loading="lazy"
                />
                <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <!--
                  <NuxtLink
                    v-if="moniteurWebsiteUrl"
                    :to="moniteurWebsiteUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-secondaryBrand-300 hover:text-secondaryBrand-200"
                  >
                    Carte professionnelle
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 11l8-8M16 3h5v5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                    </svg>
                  </NuxtLink>
                  -->
                  <NuxtLink
                    v-if="moniteurInstagramUrl"
                    :to="moniteurInstagramUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-secondaryBrand-300 hover:text-secondaryBrand-200"
                  >
                    Instagram
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="4" y="4" width="16" height="16" rx="4" />
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="16.5" cy="7.5" r="1" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="aventures" class="relative isolate pb-20">
        <div class="mx-auto max-w-7xl px-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Stages & aventures</p>
              <h2 class="mt-2 text-3xl font-semibold text-pretty text-white">Les propositions de {{ moniteurName || 'notre moniteur' }}</h2>
              <p class="mt-3 text-base text-gray-300">Découvre les prochains séjours imaginés par {{ moniteurName || 'ce guide' }}.</p>
            </div>
            <NuxtLink
              to="/stages-escalade"
              class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white hover:text-white"
            >
              Voir toutes les aventures
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
              </svg>
            </NuxtLink>
          </div>

          <div v-if="pending" class="mt-12 grid gap-8 lg:grid-cols-2">
            <div v-for="n in 2" :key="n" class="h-64 animate-pulse rounded-3xl bg-white/5" />
          </div>

          <div v-else-if="filteredAventures.length" class="mt-12 grid gap-6 lg:grid-cols-2">
            <NuxtLink
              v-for="aventure in filteredAventures"
              :key="aventure.id"
              :to="`/stages-escalade/${aventure.slug}`"
              class="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition hover:-translate-y-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
            >
              <div class="relative h-72 w-full overflow-hidden">
                <img
                  :src="aventureCoverSrc(aventure)"
                  :srcset="aventureCoverSrcset(aventure)"
                  :alt="aventure.titre"
                  class="size-full object-cover transition duration-500 hover:scale-105"
                  decoding="async"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent"></div>
                <div class="absolute inset-0 flex flex-col justify-between px-6 py-6 text-white">
                  <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
                    <div class="flex flex-wrap items-center gap-3 flex-1">
                      <span class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20">
                        {{ formatDisciplineLabel(aventure.discipline) }}
                      </span>
                      <span class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        {{ aventure.jours }} {{ aventure.jours > 1 ? 'jours' : 'jour' }}
                      </span>
                    </div>
                    <div class="ml-auto">
                      <span
                        class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/30 sm:h-14 sm:w-14"
                      >
                        <img
                          :src="iconPathForDiscipline(aventure.discipline)"
                          :alt="formatDisciplineLabel(aventure.discipline)"
                          class="h-8 w-8 object-contain sm:h-10 sm:w-10"
                        />
                      </span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-3">
                    <h2 class="text-2xl font-semibold truncate">{{ aventure.titre }}</h2>
                    <p v-if="aventure.sousTitre" class="text-sm text-brand-100/80">{{ aventure.sousTitre }}</p>
                  </div>

                  <div class="flex flex-col gap-1 text-sm text-white">
                    <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                      <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {{ aventure.nextSession ? formatSessionRange(aventure.nextSession) : 'Date à confirmer' }}
                    </span>
                    <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                      <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                        <circle cx="12" cy="11" r="2.3" />
                      </svg>
                      {{ aventure.lieuLabel }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-center justify-between text-sm text-white">
                  <div class="flex items-center gap-3 text-sm text-brand-100/80">
                    <img
                      :src="moniteurPortrait || fallbackImageForDiscipline(aventure.discipline)"
                      :srcset="moniteurPortraitSrcset"
                      :alt="moniteurName || 'Moniteur'"
                      class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
                      decoding="async"
                      sizes="40px"
                      loading="lazy"
                    />
                    <div>
                      <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                        Moniteur
                      </p>
                      <p class="font-semibold text-white">
                        {{ moniteurName || 'Moniteur local' }}
                      </p>
                    </div>
                  </div>
                  <span class="font-semibold text-right">
                    {{ aventure.prixParPersonne }} € <span class="text-brand-200 text-xs">/ pers</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else-if="!pending" class="mt-12 rounded-3xl border border-dashed border-white/20 p-12 text-center text-gray-300">
            <p>
              Ce moniteur n’a pas encore publié d’aventures. Reviens bientôt ou contacte-nous pour imaginer un séjour sur-mesure.
            </p>
          </div>

          <div v-if="error" class="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
            Impossible de charger les données du moniteur pour le moment.
          </div>
        </div>
        </section>
      </main>

      <AppFooter />
    </div>

    <teleport to="body">
      <transition name="fade">
        <div
          v-if="contactModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeGuideContactModal" />

          <div class="relative w-full max-w-2xl rounded-3xl border border-brand-800 bg-brand-900/95 p-6 shadow-2xl backdrop-blur md:p-8">
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
              @click="closeGuideContactModal"
            >
              <span class="sr-only">Fermer</span>
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>

            <div class="space-y-3">
              <p class="text-[11px] uppercase tracking-[0.3em] text-secondaryBrand-300">
                Contact moniteur
              </p>
              <h2 class="text-2xl font-semibold text-white">
                Envoyer un message WhatsApp à {{ moniteurContactFirstName }}
              </h2>
              <p class="max-w-xl text-sm text-brand-100/75">
                Ton message sera transmis au moniteur via le WhatsApp de Brigade du kiff, avec ton prénom, ton nom et ton numéro.
              </p>
            </div>

            <form class="mt-6 space-y-4" @submit.prevent="submitGuideContact">
              <div class="space-y-2">
                <label class="block text-sm text-brand-100/80">Ta demande</label>
                <textarea
                  v-model="contactMessage"
                  rows="6"
                  maxlength="2000"
                  class="w-full rounded-2xl border border-brand-800 bg-brand-950/70 px-4 py-3 text-sm text-white placeholder:text-brand-200/40 focus:border-secondaryBrand-400 focus:outline-none"
                  placeholder="Exemple : Bonjour, je cherche un stage grande voie en mai pour progresser en tête. Est-ce que tu proposes quelque chose d’adapté ?"
                ></textarea>
                <div class="flex items-center justify-between text-xs text-brand-200/65">
                  <span>Minimum 10 caractères.</span>
                  <span>{{ contactMessage.length }}/2000</span>
                </div>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  class="inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-brand-950 shadow-lg shadow-[#25D366]/30 transition hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="contactSending || contactMessage.trim().length < 10"
                >
                  <span v-if="contactSending" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900 border-t-transparent" />
                  <span>{{ contactSending ? 'Envoi en cours…' : 'Envoyer la demande' }}</span>
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5"
                  @click="closeGuideContactModal"
                >
                  Annuler
                </button>
              </div>

              <p v-if="contactSuccess" class="text-sm text-secondaryBrand-200">
                {{ contactSuccess }}
              </p>
              <p v-if="contactError" class="text-sm text-red-300">
                {{ contactError }}
              </p>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, TruckIcon } from '@heroicons/vue/24/solid'
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const slug = computed(() => route.params.slug as string)
const { loggedIn, user, fetch: fetchUserSession } = useUserSession()
const { openModal } = useAuthModal()
const pendingGuideContactPathKey = 'bdk_pending_guide_contact_path'

const { data, pending, error } = await useAsyncData(
  () => $fetch(`/api/moniteurs/${slug.value}`),
  {
    watch: [() => slug.value],
  },
)

if (data.value?.moniteur?.slug && slug.value.toLowerCase() !== data.value.moniteur.slug.toLowerCase()) {
  await navigateTo(`/moniteurs/${data.value.moniteur.slug}`, {
    redirectCode: 301,
    replace: true,
  })
}

const moniteur = computed(() => data.value?.moniteur ?? null)
const aventures = computed(() =>
  (data.value?.aventures ?? []).filter((aventure: any) => aventure?.estPublie === true),
)
const filteredAventures = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const list = (aventures.value || []).map((a: any) => {
    const nextDate = a.nextSession?.dateDebut ? new Date(a.nextSession.dateDebut).getTime() : null
    const hasSessions = Array.isArray(a.sessions) && a.sessions.length > 0
    return { ...a, nextDate, hasSessions }
  })
  return list
    .filter((a: any) => {
      if (a.nextDate) return a.nextDate >= today.getTime()
      return false
    })
    .sort((a: any, b: any) => {
      if (a.nextDate && b.nextDate) return a.nextDate - b.nextDate
      if (a.nextDate && !b.nextDate) return -1
      if (!a.nextDate && b.nextDate) return 1
      return 0
    })
})

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Terrain d\'aventure',
  VIA_FERRATA: 'Via ferrata',
}

const disciplineIconMap: Record<string, string> = {
  GRANDE_VOIE: '/images/grande-voie-white.png',
  FALAISE: '/images/couenne-white.png',
  BLOC: '/images/bloc-white.png',
  TRAD: '/images/trad-white.png',
  VIA_FERRATA: '/images/via-ferrata-white.svg',
}

const disciplineImageMap: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
  VIA_FERRATA: '/images/rappel-Calanques.jpg',
}

const iconPathForDiscipline = (value?: string | null) => {
  if (!value) return disciplineIconMap.GRANDE_VOIE
  return disciplineIconMap[value] ?? disciplineIconMap.GRANDE_VOIE
}

const fallbackImageForDiscipline = (value?: string | null) => {
  if (!value) return disciplineImageMap.GRANDE_VOIE
  return disciplineImageMap[value] ?? disciplineImageMap.GRANDE_VOIE
}

const formatDisciplineLabel = (value?: string | null) => {
  if (!value) return 'Discipline'
  return disciplineLabels[value] ?? value.replace(/_/g, ' ')
}

const moniteurName = computed(() => {
  const fullName = moniteur.value?.fullName?.trim()
  if (fullName) return fullName
  const composed = [moniteur.value?.firstName, moniteur.value?.lastName].filter(Boolean).join(' ').trim()
  return composed || null
})
const showFullBio = ref(false)
const moniteurBioValue = computed(() => moniteur.value?.bio?.trim() || '')
const moniteurBioFallback = computed(() => {
  const disciplines = disciplineChips.value.map((d) => d.label).join(' • ')
  if (disciplines) {
    return `${disciplines} — ${locationLabel.value}`
  }
  return `Escalade locale — ${locationLabel.value}`
})
const moniteurBioPreview = computed(() => {
  const bio = moniteurBioValue.value
  if (!bio) return moniteurBioFallback.value
  return bio.length > 520 ? `${bio.slice(0, 520).trimEnd()}…` : bio
})
const moniteurBioFull = computed(() => moniteurBioValue.value || moniteurBioFallback.value)
const moniteurHasLongBio = computed(() => moniteurBioValue.value.length > 520)
const moniteurBioText = computed(() => (showFullBio.value ? moniteurBioFull.value : moniteurBioPreview.value))
const moniteurPortrait = computed(() => {
  const src = resolveStoredImageSrc(moniteur.value?.profileImageUrl, moniteur.value?.profileImageVariants)
  if (src) return src
  return heroBackground.value || '/images/escalade-grande-voie-calanques.jpg'
})
const moniteurPortraitSrcset = computed(() => buildStoredSrcset(moniteur.value?.profileImageVariants))
const heroBackground = computed(
  () => resolveStoredImageSrc(moniteur.value?.heroImageUrl, moniteur.value?.heroImageVariants) || fallbackImageForDiscipline(),
)
const heroBackgroundSrcset = computed(() => buildStoredSrcset(moniteur.value?.heroImageVariants))
const locationLabel = computed(() => moniteur.value?.baseLocation || moniteur.value?.department || 'France')
const moniteurContactFirstName = computed(() => moniteur.value?.firstName?.trim() || 'ce moniteur')
const siteBaseUrl = computed(() => resolvePublicSiteUrl(runtimeConfig.public.publicUrl))
const homeUrl = computed(() => {
  try {
    return new URL('/', siteBaseUrl.value).toString()
  } catch {
    return '/'
  }
})
const laBrigadeUrl = computed(() => {
  try {
    return new URL('/la-brigade', siteBaseUrl.value).toString()
  } catch {
    return '/la-brigade'
  }
})
const canonicalGuideUrl = computed(() =>
  moniteur.value?.slug ? new URL(`/moniteurs/${moniteur.value.slug}`, siteBaseUrl.value).toString() : null,
)
const contactModalOpen = ref(false)
const contactMessage = ref('')
const contactSending = ref(false)
const contactError = ref<string | null>(null)
const contactSuccess = ref<string | null>(null)

const aventureCoverSrc = (aventure: any) => {
  return resolveStoredImageSrc(aventure?.coverImageUrl, aventure?.coverImageVariants) || fallbackImageForDiscipline(aventure?.discipline)
}

const aventureCoverSrcset = (aventure: any) => {
  return buildStoredSrcset(aventure?.coverImageVariants)
}

const moniteurPortraitAbsolute = computed(() => {
  const image = moniteurPortrait.value
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  try {
    return new URL(image, siteBaseUrl.value).toString()
  } catch {
    return image
  }
})

const breadcrumbStructuredData = computed(() => {
  if (!moniteur.value || !canonicalGuideUrl.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: homeUrl.value,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'La Brigade',
        item: laBrigadeUrl.value,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: moniteurName.value || moniteur.value.fullName || 'Moniteur',
        item: canonicalGuideUrl.value,
      },
    ],
  }
})

const profilePageStructuredData = computed(() => {
  if (!moniteur.value || !canonicalGuideUrl.value) return null

  const sameAs = [moniteurInstagramUrl.value, moniteurWebsiteUrl.value].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@id': `${canonicalGuideUrl.value}#person`,
      '@type': 'Person',
      name: moniteurName.value || moniteur.value.fullName || 'Moniteur',
      identifier: moniteur.value.id != null ? String(moniteur.value.id) : undefined,
      description: moniteur.value.bio || undefined,
      image: moniteurPortraitAbsolute.value || undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    },
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: canonicalGuideUrl.value
    ? [
        {
          rel: 'canonical',
          href: canonicalGuideUrl.value,
        },
      ]
    : [],
  script: breadcrumbStructuredData.value
    ? [
        {
          key: 'guide-breadcrumb-jsonld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(breadcrumbStructuredData.value),
        },
        ...(profilePageStructuredData.value
          ? [
              {
                key: 'guide-profilepage-jsonld',
                type: 'application/ld+json',
                innerHTML: JSON.stringify(profilePageStructuredData.value),
              },
            ]
          : []),
      ]
    : profilePageStructuredData.value
      ? [
          {
            key: 'guide-profilepage-jsonld',
            type: 'application/ld+json',
            innerHTML: JSON.stringify(profilePageStructuredData.value),
          },
        ]
      : [],
}))

const seoTitle = computed(() => {
  const fullName = moniteurName.value
  return fullName
    ? `${fullName}, moniteur d'escalade de la Brigade du kiff`
    : "Moniteur d'escalade de la Brigade du kiff"
})
const seoDescription = computed(
  () =>
    moniteur.value?.bio?.slice(0, 155) ||
    'Collectif de moniteurs diplômés proposant des stages d’escalade outdoor.',
)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: moniteurPortrait,
  robots: 'index, follow, max-image-preview:large',
})

const moniteurWebsiteUrl = computed(() => {
  const card = moniteur.value?.professionalCardNumber || moniteur.value?.guideProfile?.professionalCardNumber
  if (card) {
    return `https://recherche-educateur.sports.gouv.fr/CartePro/${card}`
  }
  
  return null
})

const moniteurInstagramUrl = computed(() => {
  return (
    moniteur.value?.guideProfile?.instagramUrl ||
    moniteur.value?.profile?.instagramUrl ||
    null
  )
})

const disciplineChips = computed(() => {
  const disciplines = moniteur.value?.disciplines ?? []
  if (!disciplines.length && aventures.value.length) {
    return Array.from(new Set(aventures.value.map((a: any) => a.discipline).filter(Boolean))).map((value: string) => ({
      value,
      label: formatDisciplineLabel(value),
    }))
  }
  return disciplines.map((value: string) => ({
    value,
    label: formatDisciplineLabel(value),
  }))
})


const nextSessionLabel = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()

  const candidates: number[] = []
  for (const a of aventures.value || []) {
    if (a?.nextSession?.dateDebut) {
      const ts = new Date(a.nextSession.dateDebut).getTime()
      if (!Number.isNaN(ts) && ts >= todayMs) candidates.push(ts)
    }
    if (Array.isArray(a?.sessions)) {
      for (const s of a.sessions) {
        if (!s?.dateDebut) continue
        const ts = new Date(s.dateDebut).getTime()
        if (!Number.isNaN(ts) && ts >= todayMs) candidates.push(ts)
      }
    }
  }
  if (candidates.length) {
    const nextTs = Math.min(...candidates)
    return formatFullDate(nextTs)
  }

  const stats = moniteur.value?.stats
  if (stats?.prochaineDate) {
    const ts = new Date(stats.prochaineDate).getTime()
    if (!Number.isNaN(ts) && ts >= todayMs) {
      return formatFullDate(ts)
    }
  }
  return 'Sur demande'
})

const aventuresCountLabel = computed(() => {
  const stats = moniteur.value?.stats
  const count = stats?.aventuresPubliees ?? aventures.value.length
  if (!count) return 'Bientôt disponible'
  return `${count} aventure${count > 1 ? 's' : ''}`
})

const featureList = computed(() => [
  {
    icon: HomeIcon,
    title: 'Camp de base',
    description: locationLabel.value,
  },
  {
    icon: TruckIcon,
    title: 'Prochain départ',
    description: nextSessionLabel.value,
  },
])

const clearGuideContactQuery = async () => {
  if (route.query.contact !== '1') return
  const query = { ...route.query }
  delete query.contact
  await router.replace({ query })
}

const storePendingGuideContact = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(pendingGuideContactPathKey, route.path)
}

const closeGuideContactModal = () => {
  contactModalOpen.value = false
  contactError.value = null
  contactSuccess.value = null
}

const handleGuideContactClick = async () => {
  await fetchUserSession()

  if (!loggedIn.value || user.value?.role === 'GUIDE') {
    storePendingGuideContact()
    openModal()
    return
  }

  contactError.value = null
  contactSuccess.value = null
  contactModalOpen.value = true
}

const submitGuideContact = async () => {
  contactError.value = null
  contactSuccess.value = null
  contactSending.value = true

  try {
    const response: any = await $fetch(`/api/moniteurs/${slug.value}/contact`, {
      method: 'POST',
      body: {
        message: contactMessage.value,
      },
    })
    contactSuccess.value = response?.message || `Ton message a bien été envoyé à ${moniteurContactFirstName.value}.`
    contactMessage.value = ''
  } catch (e: any) {
    contactError.value = e?.data?.message || 'Impossible d’envoyer ta demande pour le moment.'
  } finally {
    contactSending.value = false
  }
}

watch(
  [() => route.query.contact, loggedIn, () => user.value?.role],
  async ([contact, isLoggedIn, role]) => {
    if (contact !== '1') return
    if (!isLoggedIn || role === 'GUIDE') {
      storePendingGuideContact()
      openModal()
      await clearGuideContactQuery()
      return
    }

    contactError.value = null
    contactSuccess.value = null
    contactModalOpen.value = true
    await clearGuideContactQuery()
  },
  { immediate: true },
)

onMounted(() => {
  fetchUserSession()
})


const formatFullDate = (dateInput: string | number | Date) => {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatter.format(new Date(dateInput))
}

const formatSessionRange = (session?: { dateDebut?: string | Date; dateFin?: string | Date } | null) => {
  if (!session?.dateDebut) return 'Dates à confirmer'
  const start = formatFullDate(session.dateDebut)
  if (!session.dateFin) return start
  const end = formatFullDate(session.dateFin)
  return start === end ? start : `${start} → ${end}`
}

const formatPrice = (value?: number | null) => {
  if (!value) return 'Tarif sur demande'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>
