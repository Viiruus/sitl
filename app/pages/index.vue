<template>
  <div class="bg-brand-950">
    <!-- Header réutilisable -->
    <AppHeader />

    <!-- Hero Section -->
    <div class="relative min-h-screen">
      <div class="mx-auto max-w-7xl">
        <div class="relative z-10 flex min-h-screen flex-col pt-14 lg:w-full lg:max-w-2xl">
          <svg class="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-brand-950 lg:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="0,0 90,0 50,100 0,100" />
          </svg>

          <div class="relative flex flex-1 flex-col justify-center px-6 py-20 sm:py-32 lg:px-8 lg:py-40 lg:pr-0 2xl:py-56">
            <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <h1 class="text-5xl font-semibold tracking-tight text-pretty text-white sm:text-7xl">Vos aventures verticales commencent ici.</h1>
              <p class="mt-8 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">Escalade outdoor encadrée par nos moniteurs locaux passionnés</p>
              <div class="mt-10 flex items-center gap-x-6">
                <NuxtLink to="/aventures-escalade" class="rounded-md bg-secondaryBrand-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
                  Les prochains départs
                </NuxtLink>
                <NuxtLink to="/login" class="text-sm/6 font-semibold text-white">
                  Rejoindre la communauté <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hidden bg-brand-950 lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2 min-h-[50vh] lg:min-h-screen">
        <picture class="block h-full w-full">
          <source
            media="(min-width: 1024px)"
            type="image/webp"
            srcset="/images/optimized/escalade0-840.webp 840w, /images/optimized/escalade0-1120.webp 1120w, /images/optimized/escalade0-1680.webp 1680w"
            sizes="50vw"
          />
          <source media="(min-width: 1024px)" srcset="/images/escalade0.jpg" />
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
            alt=""
            class="h-full w-full object-cover"
            width="1680"
            height="3648"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
    </div>
  </div>
  
    <!-- Section Bénéfices -->
  <section class="bg-brand-900 py-20 sm:py-28 text-white">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <p class="text-lg font-semibold uppercase tracking-[0.4em] text-secondaryBrand-200">
        Notre mission ?
      </p>
      <div class="mt-3 flex items-baseline gap-3">
        <span class="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
          Votre
        </span>
        <span class="text-4xl font-semibold text-secondaryBrand-200 sm:text-5xl lg:text-6xl transition-colors duration-300">
          {{ activeBenefitWord }}
        </span>
      </div>
      <div class="mt-6 space-y-4 text-base leading-relaxed text-brand-100/85">
        <p>
          La Brigade du kiff, c’est une équipe passionnée par escalade mais surtout par les humains.
          Notre objectif est de te faire passer un moment inoubliable en pleine nature et en bonne compagnie.
        </p>
        <p>
          Viens grimper dans les spots les plus canons mais surtout les plus adaptés à ta pratique.
          Et ce n’est pas tout : notre priorité c’est ta progression. Nos moniteurs sont déterminés à te faire performer.
        </p>
        <p>
          Rejoins la team et
          <NuxtLink to="/aventures-escalade" class="font-semibold text-secondaryBrand-200 hover:text-secondaryBrand-400 underline underline-offset-4">
            inscris-toi
          </NuxtLink>
          à un prochain stage !
        </p>
      </div>

      <div class="mt-20 grid gap-6 sm:gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="benefit in benefits"
          :key="benefit.title"
          class="flex flex-col items-center gap-4 rounded-3xl bg-white/5 px-4 py-6 ring-1 ring-white/10 shadow-md shadow-black/20 transition hover:-translate-y-1 hover:ring-secondaryBrand-300/50"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 shadow-inner shadow-black/10">
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

  <!-- Section Activités -->
  <section class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <h2 class="mt-4 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-6xl">
        L’escalade sous toutes ses formes
      </h2>
      <p class="mt-4 text-base text-gray-600">
        L’escalade est une pratique sportive exceptionnellement riche.
      </p>
      <p class="mt-4 text-base text-gray-600">
        Chez la Brigade du kiff, nous avons souhaité les organiser en 4 grandes catégories même s’il existe une infinie de sensibilités différentes…
        <br/>
        Qu’il s’agisse d’une bambée de plusieurs centaines de mètres en terrain d’aventure ou d’un bloc déversant hyper technique, ce n’est pas la même discipline !
        <br/>
        Pourtant, toutes ces spécificités se complètent et font de toi un meilleur grimpeur ou une meilleure grimpeuse.
      </p>
      <p class="mt-4 text-base text-gray-600">
        Alors en selle,
        <NuxtLink to="/aventures-escalade" class="font-semibold text-brand-700 hover:text-brand-900 underline underline-offset-4">
          rejoins l’aventure
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
            <h3 class="text-2xl font-semibold text-gray-900">
              {{ activity.title }}
            </h3>
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

  <!-- Section Stages -->
  <section id="stages" class="bg-brand-950 py-24 sm:py-32 text-white">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <h2 class="text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-6xl">
        Les prochains stages d'escalade
      </h2>
      <p class="mt-2 text-lg/8 text-brand-100/80">
        Embarque pour notre prochaine aventure.
      </p>

      <div v-if="aventuresPending" class="mt-12 text-sm text-brand-100/70">
        Chargement des stages...
      </div>
      <div v-else-if="!upcomingStages.length" class="mt-12 text-sm text-brand-100/70">
        Encore aucune date publiée. Reviens très vite !
      </div>
      <div v-else class="mt-12 grid gap-6 md:grid-cols-3">
        <NuxtLink
          v-for="stage in upcomingStages"
          :key="stage.id"
          :to="`/aventures-escalade/${stage.slug}`"
          class="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition hover:-translate-y-1"
        >
          <div class="relative h-52">
            <img
              :src="stageCoverSrc(stage)"
              :srcset="stageCoverSrcset(stage)"
              :alt="stage.titre"
              class="size-full object-cover transition duration-500 hover:scale-105"
              decoding="async"
              sizes="(min-width: 1024px) 33vw, 100vw"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent"></div>
            <div class="absolute inset-4 flex flex-col justify-between">
              <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
                <div class="flex flex-wrap items-center gap-2 flex-1">
                  <span
                    class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20"
                  >
                    {{ formatDisciplineLabel(stage.discipline) }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                  >
                    {{ stage.jours }} {{ stage.jours > 1 ? 'jours' : 'jour' }}
                  </span>
                </div>
                <div class="ml-auto">
                  <span
                    class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/30 sm:h-14 sm:w-14"
                  >
                    <img
                      :src="iconPathForDiscipline(stage.discipline)"
                      :alt="formatDisciplineLabel(stage.discipline)"
                      class="h-8 w-8 object-contain sm:h-10 sm:w-10"
                    />
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1 text-sm text-white">
                <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                  <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {{ stage.nextSession ? formatSessionRange(stage.nextSession) : 'Date à confirmer' }}
                </span>
                <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                  <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                    <circle cx="12" cy="11" r="2.3" />
                  </svg>
                  {{ stage.lieuLabel }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-5">
            <h3 class="mt-2 text-xl font-semibold text-white">
              {{ stage.titre }}
            </h3>
            <p class="mt-1 line-clamp-2 text-sm text-brand-100/80">
              {{ stage.sousTitre }}
            </p>
            <div class="mt-6 flex items-center justify-between text-sm text-white">
              <div class="flex items-center gap-3 text-sm text-brand-100/80">
                <img
                  :src="guideAvatarSrc(stage)"
                  :srcset="guideAvatarSrcset(stage)"
                  :alt="stage.guideName || 'Moniteur'"
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
                    {{ stage.guideName || 'Moniteur local' }}
                  </p>
                </div>
              </div>
              <span class="font-semibold text-right">
                {{ stage.prixParPersonne }} € <span class="text-brand-200 text-xs">/ pers</span>
              </span>
            </div>
          </div>
        </NuxtLink>
        <div class="md:col-span-3 flex justify-center">
          <NuxtLink
            to="/aventures-escalade"
            class="mt-12 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Voir tous les stages
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer réutilisable -->
  <AppFooter />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'

useSeoMeta({
  title: 'Aventures d’escalade encadrées | Falaise, grande voie, bloc, trad, via ferrata',
  description:
    'Des stages d’escalade outdoor pour progresser avec des moniteurs locaux. Choisis ton terrain de jeu et pars à l’aventure.',
  robots: 'index, follow, max-image-preview:large',
})

const { data: aventuresData, pending: aventuresPending } = useFetch('/api/aventures', {
  query: {
    mode: 'home',
    limit: 3,
  },
  default: () => ({ aventures: [] }),
})

const upcomingStages = computed(() => aventuresData.value?.aventures ?? [])

const stageCoverSrc = (stage: any) => {
  return resolveStoredImageSrc(stage?.coverImageUrl, stage?.coverImageVariants) || imageForDiscipline(stage?.discipline)
}

const stageCoverSrcset = (stage: any) => {
  return buildStoredSrcset(stage?.coverImageVariants)
}

const guideAvatarSrc = (stage: any) => {
  return resolveStoredImageSrc(stage?.guideImageUrl, stage?.guideImageVariants) || imageForDiscipline(stage?.discipline)
}

const guideAvatarSrcset = (stage: any) => {
  return buildStoredSrcset(stage?.guideImageVariants)
}

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
      href: '/aventures-escalade?discipline=FALAISE',
      picto: '/images/couenne.png',
    },
    {
      title: 'Grande voie',
      description:
        'Enchaîne plusieurs longueurs (jusqu’à plusieurs centaines de mètres) encordé·e à 2 ou 3 personnes avec matériel et techniques spécifiques : relais, rappels, assurage…',
      cta: 'Les stages grande voie',
      href: '/aventures-escalade?discipline=GRANDE_VOIE',
      picto: '/images/grande-voie.png',
    },
    {
      title: 'Via ferrata',
      description:
        "Progression équipée sur falaises avec barreaux, câbles et ponts. Un mix entre rando verticale et sensations en paroi.",
      cta: 'Les stages via ferrata',
      href: '/aventures-escalade?discipline=VIA_FERRATA',
      picto: '/images/via-ferrata.svg',
    },
    {
      title: 'Trad',
      description:
        'En escalade traditionnelle, tu places toi-même tes protections dans les faiblesses du rocher à l’aide de coinceurs, friends, pitons ou sangles.',
      cta: 'Les stages trad',
      href: '/aventures-escalade?discipline=TRAD',
      picto: '/images/trad.png',
    },
    {
      title: 'Bloc',
      description:
        'Sans corde et sur des blocs de moins de 5m, avec parade et crashpads pour amortir les chutes. Parfait pour travailler la gestuelle et la puissance.',
      cta: 'Les stages bloc',
      href: '/aventures-escalade?discipline=BLOC',
      picto: '/images/bloc.png',
    },
  ];

  const disciplineLabels: Record<string, string> = {
    GRANDE_VOIE: 'Grande voie',
    FALAISE: 'Falaise',
    BLOC: 'Bloc',
    TRAD: 'Trad',
    VIA_FERRATA: 'Via ferrata',
  }

  const formatDisciplineLabel = (value?: string | null) => {
    if (!value) return 'Aventure'
    return disciplineLabels[value] ?? value
  }

  const disciplineImages: Record<string, string> = {
    GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
    FALAISE: '/images/falaise-escalade-beaufortain.jpg',
    BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
    TRAD: '/images/falaise-Calanques2.jpg',
    VIA_FERRATA: '/images/rappel-Calanques.jpg',
  }

  const imageForDiscipline = (value?: string | null) => {
    if (!value) return '/images/escalade-grande-voie-calanques.jpg'
    return disciplineImages[value] || '/images/escalade-grande-voie-calanques.jpg'
  }

  const formatSessionRange = (session: any) => {
    if (!session?.dateDebut || !session?.dateFin) return ''
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    const start = formatter.format(new Date(session.dateDebut))
    const end = formatter.format(new Date(session.dateFin))
    return start === end ? start : `${start} → ${end}`
  }

  const disciplineIconMap: Record<string, string> = {
    GRANDE_VOIE: '/images/grande-voie-white.png',
    FALAISE: '/images/couenne-white.png',
    BLOC: '/images/bloc-white.png',
    TRAD: '/images/trad-white.png',
    VIA_FERRATA: '/images/via-ferrata-white.svg',
  }

  const iconPathForDiscipline = (value?: string | null) => {
    if (!value) return disciplineIconMap.GRANDE_VOIE
    return disciplineIconMap[value] ?? disciplineIconMap.GRANDE_VOIE
  }

</script>

<style>
  html {
    scroll-behavior: smooth;
  }
</style>
