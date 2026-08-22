<template>
  <div>
    <AppHeader />

    <!-- Ancien encart « Notre mission ? », conservé pour mémoire. -->
    <section class="bg-brand-900 py-20 pt-32 text-white sm:py-28 sm:pt-40">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <p class="text-lg font-semibold uppercase tracking-[0.4em] text-secondaryBrand-200">
          Notre mission ?
        </p>
        <div class="mt-3 flex items-baseline gap-3">
          <span class="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Votre
          </span>
          <span class="text-4xl font-semibold text-secondaryBrand-200 transition-colors duration-300 sm:text-5xl lg:text-6xl">
            {{ activeBenefitWord }}
          </span>
        </div>
        <div class="mt-6 space-y-4 text-base leading-relaxed text-brand-100/85">
          <p>
            La Brigade du kiff est un collectif de moniteur.ices d'escalade diplômé.e.s d'état réunis sous la forme
            d'une association pour te proposer les meilleurs expériences d’escalade en milieux naturels.
          </p>
          <p>
            Nous sélectionnons les spots avec soin pour te faire kiffer et progresser dans les conditions les plus
            adaptées. Rejoins l’aventure en
            <NuxtLink to="/stages-escalade" class="font-semibold text-secondaryBrand-200 underline underline-offset-4 hover:text-secondaryBrand-400">
              t’inscrivant à un prochain stage
            </NuxtLink>
            !
          </p>
        </div>

        <div class="mt-20 grid gap-6 text-center sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="flex flex-col items-center gap-4 rounded-3xl bg-white/5 px-4 py-6 shadow-md shadow-black/20 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-secondaryBrand-300/50"
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 shadow-inner shadow-black/10 ring-1 ring-white/15">
              <svg v-if="benefit.icon === 'leaf'" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 17.5 9.5 8l3.5 5 3-4.5L21 17.5H3Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 17.5h18" />
              </svg>
              <svg v-else-if="benefit.icon === 'progress'" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 18h4V9H4v9Zm6 0h4v-6h-4v6Zm6 0h4V5h-4v13Z" />
              </svg>
              <svg v-else-if="benefit.icon === 'heart'" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
              </svg>
              <svg v-else class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c3.3 0 6 2.6 6 5.8 0 3.9-3.7 8.2-5.5 9.9a.7.7 0 0 1-1 0C9.7 17 6 12.6 6 8.8 6 5.6 8.7 3 12 3Z" />
                <circle cx="12" cy="9" r="2.2" />
              </svg>
            </div>
            <div class="flex flex-col items-center gap-2">
              <span class="inline-flex items-center rounded-full bg-secondaryBrand-300/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 shadow-sm shadow-secondaryBrand-900/20">
                {{ benefit.kicker }}
              </span>
              <h3 class="text-sm font-semibold text-white">
                {{ benefit.title }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ancien encart « L’escalade sous toutes ses formes », conservé pour mémoire. -->
    <section class="bg-white py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-6xl">
          L’escalade sous toutes ses formes
        </h1>
        <p class="mt-4 text-base text-gray-600">
          L’escalade est une pratique sportive exceptionnellement riche… Pour coller au mieux à tes attentes et faciliter
          ta progression, nous proposons 5 grandes catégories.
        </p>
        <p class="mt-4 text-base text-gray-600">
          Et oui ! Qu’il s’agisse d’une bambée de plusieurs centaines de mètres en terrain d’aventure ou d’un bloc
          déversant hyper technique, ce n’est pas la même discipline !
        </p>
        <p class="mt-4 text-base text-gray-600">
          Pourtant, toutes ces spécificités se complètent et font de toi un meilleur grimpeur ou une meilleure
          grimpeuse. Alors profite de l’expérience de nos moniteur.ices en
          <NuxtLink to="/stages-escalade" class="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900">
            rejoignant un prochain stage
          </NuxtLink>
          !
        </p>

        <div class="mt-12 grid gap-6 lg:grid-cols-2">
          <article
            v-for="activity in activities"
            :key="activity.title"
            class="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">
                <img
                  :src="activity.picto"
                  :alt="activity.title"
                  class="h-10 w-10 object-contain"
                  loading="lazy"
                />
              </div>
              <h2 class="text-2xl font-semibold text-gray-900">
                {{ activity.title }}
              </h2>
            </div>
            <p class="mt-4 text-sm text-gray-600">
              {{ activity.description }}
            </p>
            <NuxtLink
              :to="activity.href"
              class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-600 hover:text-secondaryBrand-500"
            >
              {{ activity.cta }}
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
              </svg>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

useSeoMeta({
  title: 'Mémoire des anciens contenus de l’accueil',
  description: 'Archive interne des anciens contenus de la page d’accueil.',
  robots: 'noindex, nofollow',
  googleBot: 'noindex, nofollow',
})

const rotatingBenefitWords = ['Progression', 'Immersion', 'Déconnexion', 'Reconnexion']
const activeBenefitWordIndex = ref(0)
const activeBenefitWord = computed(() => rotatingBenefitWords[activeBenefitWordIndex.value])

let benefitInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  benefitInterval = setInterval(() => {
    activeBenefitWordIndex.value = (activeBenefitWordIndex.value + 1) % rotatingBenefitWords.length
  }, 2500)
})

onBeforeUnmount(() => {
  if (benefitInterval) clearInterval(benefitInterval)
})

const benefits = [
  {
    kicker: 'Outdoor',
    title: 'Reconnecte avec le milieu naturel',
    icon: 'leaf',
    description: 'Retrouve le rocher, les odeurs de pin et les lumières changeantes. Un vrai shoot d’outdoor.',
  },
  {
    kicker: 'Progression',
    title: 'Émulation garantie',
    icon: 'progress',
    description: 'Un cadre sécurisé, des tips concrets et un groupe motivé pour booster ta progression.',
  },
  {
    kicker: 'Communauté',
    title: 'Rencontre tes futurs partenaires',
    icon: 'heart',
    description: 'Des rencontres qui comptent : les cordées et les potes avec qui tu grimperas demain.',
  },
  {
    kicker: 'Authenticité',
    title: 'Moniteurs locaux passionnés',
    icon: 'pin',
    description: 'Des guides du cru, amoureux de leurs falaises et de leur culture, pour des aventures vraies.',
  },
]

const activities = [
  {
    title: 'Falaise',
    description:
      'Escalade d’une longueur aussi appelée “couenne” ou “escalade de difficulté” qui vise à gravir une paroi de 10m à 50m en s’assurant à l’aide de dégaines sur des points fixes.',
    cta: 'Les stages falaise',
    href: '/stages-escalade?discipline=FALAISE',
    picto: '/images/couenne.png',
  },
  {
    title: 'Grande voie',
    description:
      'Enchaîne plusieurs longueurs (jusqu’à plusieurs centaines de mètres) encordé·e à 2 ou 3 personnes avec matériel et techniques spécifiques : relais, rappels, assurage…',
    cta: 'Les stages grande voie',
    href: '/disciplines/grande-voie',
    picto: '/images/grande-voie.png',
  },
  {
    title: 'Via ferrata',
    description: 'Progression équipée sur falaises avec barreaux, câbles et ponts. Un mix entre rando verticale et sensations en paroi.',
    cta: 'Les stages via ferrata',
    href: '/stages-escalade?discipline=VIA_FERRATA',
    picto: '/images/via-ferrata.svg',
  },
  {
    title: 'Terrain d\'aventure',
    description:
      'Dans l\'escalade en terrain d\'aventure, tu places toi-même tes protections dans les faiblesses du rocher à l’aide de coinceurs, friends, pitons ou sangles.',
    cta: 'Les stages en terrain d\'aventure',
    href: '/stages-escalade?discipline=TERRAIN_AVENTURE',
    picto: '/images/trad.png',
  },
  {
    title: 'Bloc',
    description:
      'Sans corde et sur des blocs de moins de 5m, avec parade et crashpads pour amortir les chutes. Parfait pour travailler la gestuelle et la puissance.',
    cta: 'Les stages bloc',
    href: '/stages-escalade?discipline=BLOC',
    picto: '/images/bloc.png',
  },
]
</script>
