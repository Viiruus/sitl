<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)
const isNotFound = computed(() => statusCode.value === 404)

const pageTitle = computed(() =>
  isNotFound.value
    ? '404 — Cette voie reste introuvable'
    : '500 — Le serveur vient de zipper',
)

const heading = computed(() =>
  isNotFound.value
    ? 'Cette voie n’est pas dans le topo.'
    : 'Le serveur vient de zipper.',
)

const description = computed(() =>
  isNotFound.value
    ? 'On a suivi les spits, regardé derrière le surplomb… rien. La page a peut-être changé de relais ou pris la tangente.'
    : 'Pas de panique, la corde tient. Notre équipe technique reprend ses marques et devrait repartir dans la voie rapidement.',
)

const routeNote = computed(() =>
  isNotFound.value
    ? 'Cotation du passage : introuvable'
    : 'Manœuvre en cours : remise au relais',
)

useSeoMeta({
  title: pageTitle,
  description,
  robots: 'noindex, nofollow',
})

const goHome = () => clearError({ redirect: '/' })
const seeStages = () => clearError({ redirect: '/stages-escalade' })

const retry = () => {
  if (import.meta.client) window.location.reload()
}
</script>

<template>
  <main class="error-page relative isolate min-h-screen overflow-hidden bg-brand-950 text-white">
    <div class="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(245,158,11,0.15),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(14,165,233,0.12),transparent_36%)]" />
    <div class="error-grid absolute inset-0 -z-10 opacity-25" />
    <div class="absolute -left-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-secondaryBrand-400/10 blur-3xl" />

    <header class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 sm:px-10 lg:px-12">
      <button type="button" class="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-300" @click="goHome">
        <span class="sr-only">Retour à l’accueil</span>
        <img
          src="~/assets/images/brigade-du-kiff_amber-logo.png"
          alt="Brigade du Kiff"
          class="h-9 w-auto sm:h-11"
        >
      </button>
      <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-100/70 backdrop-blur">
        Erreur {{ statusCode }}
      </span>
    </header>

    <section class="mx-auto grid min-h-[calc(100vh-105px)] w-full max-w-7xl items-center gap-10 px-6 pb-14 pt-4 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12 lg:pb-20">
      <div class="relative z-10 max-w-2xl">
        <p class="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-secondaryBrand-300">
          <span class="h-px w-10 bg-secondaryBrand-400" />
          {{ isNotFound ? 'Itinéraire hors ligne' : 'Petit vol technique' }}
        </p>

        <h1 class="font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
          {{ heading }}
        </h1>
        <p class="mt-7 max-w-xl text-base leading-7 text-brand-100/75 sm:text-lg sm:leading-8">
          {{ description }}
        </p>

        <div class="mt-9 flex flex-col gap-3 sm:flex-row">
          <button
            v-if="isNotFound"
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-400 px-6 py-3.5 text-sm font-bold text-brand-950 shadow-glow hover:bg-secondaryBrand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            @click="goHome"
          >
            Retour au camp de base
            <span aria-hidden="true">→</span>
          </button>
          <button
            v-else
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-400 px-6 py-3.5 text-sm font-bold text-brand-950 shadow-glow hover:bg-secondaryBrand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            @click="retry"
          >
            Retenter le passage
            <span aria-hidden="true">↻</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur hover:border-white/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            @click="seeStages"
          >
            Voir les stages
          </button>
        </div>

        <div class="mt-10 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-xs text-brand-100/60 backdrop-blur">
          <span class="h-2.5 w-2.5 rounded-full bg-secondaryBrand-400" />
          {{ routeNote }}
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-[620px]" aria-hidden="true">
        <div class="absolute inset-x-[12%] bottom-[4%] h-16 rounded-[50%] bg-black/50 blur-2xl" />
        <div class="flex aspect-[31/26] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40 backdrop-blur-sm">
          <span class="font-display text-[10rem] font-black leading-none tracking-[-0.08em] text-secondaryBrand-400 sm:text-[14rem] lg:text-[16rem]">
            {{ statusCode }}
          </span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.error-grid {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, black, transparent 85%);
}
</style>
