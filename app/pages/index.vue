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
        <img class="h-full w-full object-cover" src="~/assets/images/escalade0.jpg" alt="" />
      </div>
    </div>
  </div>
  
    <!-- Section Bénéfices -->
  <section class="bg-brand-900 py-20 sm:py-28 text-white">
    <div class="mx-auto max-w-5xl px-6 text-center lg:px-8">
      <h2 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Notre mission ?
      </h2>
      <p class="mt-6 text-base text-brand-100/80">
        La Brigade du kiff, c’est une équipe de passionné.e.s par l’escalade mais surtout par les humains.
        <br/>
        Notre objectif est de te faire passer un moment inoubliable en pleine nature et en bonne compagnie.
      </p>
      <p class="mt-4 text-base text-brand-100/80">
        Viens grimper dans les spots les plus jolis mais surtout les plus adaptés à ta pratique.
        <br/>
        Et ce n’est pas tout : notre priorité c’est ta progression. Nos moniteurs sont déterminés à te faire performer.
      </p>
      <p class="mt-4 text-base text-brand-100/80">
        Rejoins la team et
        <NuxtLink to="/login" class="font-semibold text-secondaryBrand-200 hover:text-secondaryBrand-100 underline underline-offset-4">
          inscris-toi
        </NuxtLink>
        à un prochain stage !
      </p>

      <div class="mt-12 mb-8">
        <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 ring-1 ring-white/10">
          <div
            class="flex transition-transform duration-700 ease-out"
            :style="{ transform: `translateX(-${benefitCarouselIndex * 100}%)` }"
            @mouseenter="benefitCarouselPaused = true"
            @mouseleave="benefitCarouselPaused = false"
          >
            <article
              v-for="benefit in benefits"
              :key="benefit.title"
              class="relative isolate h-[36rem] w-full flex-shrink-0 overflow-hidden"
            >
              <img
                :src="benefit.image"
                :alt="benefit.title"
                class="absolute inset-0 size-full object-cover transition duration-700"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent" />
              <div class="absolute inset-0 flex flex-col justify-end gap-3 p-6 mb-12">
                <div class="flex items-center justify-center">
                  <span class="inline-flex max-w-fit items-center gap-2 rounded-full bg-secondaryBrand-300/95 px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.5em] text-brand-950 shadow-lg shadow-secondaryBrand-900/40">
                    <span class="h-2 w-2 rounded-full bg-brand-900/70" />
                    {{ benefit.kicker }}
                  </span>
                </div>
                <h3 class="text-2xl font-semibold text-white text-center">
                  {{ benefit.title }}
                </h3>
                <p class="text-sm text-brand-100/90 leading-relaxed text-center">
                  {{ benefit.description }}
                </p>
              </div>
            </article>
          </div>
          <div class="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            <button
              v-for="(benefit, idx) in benefits"
              :key="benefit.title + idx"
              type="button"
              class="h-2.5 w-8 rounded-full transition"
              :class="idx === benefitCarouselIndex ? 'bg-secondaryBrand-300' : 'bg-white/30 hover:bg-white/60'"
              @click="benefitCarouselIndex = idx"
              aria-label="Aller à la diapositive"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section Activités -->
  <section class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <h2 class="mt-4 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
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
        <NuxtLink to="/login" class="font-semibold text-brand-700 hover:text-brand-900 underline underline-offset-4">
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
      <h2 class="text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
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
              :src="stage.coverImageUrl || imageForDiscipline(stage.discipline)"
              :alt="stage.titre"
              class="size-full object-cover transition duration-500 hover:scale-105"
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
                  :src="stage.guideImageUrl || imageForDiscipline(stage.discipline)"
                  :alt="stage.guideName || 'Moniteur'"
                  class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
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

const { data: aventuresData, pending: aventuresPending } = await useFetch('/api/aventures')

  const upcomingStages = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const list = (aventuresData.value?.aventures ?? [])
      .map((stage: any) => {
        const nextDate = stage.nextSession?.dateDebut ? new Date(stage.nextSession.dateDebut) : null
        const hasSessions = Array.isArray(stage.sessions) && stage.sessions.length > 0
        return { ...stage, nextSessionDate: nextDate, hasSessions }
      })
      .filter((stage: any) => {
        if (stage.nextSessionDate) {
          return stage.nextSessionDate.getTime() >= today.getTime()
        }
        // If there are sessions but none upcoming, drop it
        if (stage.hasSessions) return false
        // Keep undated stages
        return true
      })

    const withNext = list
      .filter((stage: any) => stage.nextSessionDate)
      .sort((a: any, b: any) => (a.nextSessionDate as any) - (b.nextSessionDate as any))

    const withoutNext = list.filter((stage: any) => !stage.nextSessionDate)
    const ordered = [...withNext, ...withoutNext]

    return ordered.slice(0, 3)
  })

  const faqs = [
    {
      question: 'La différence entre l\'escalade en couenne et l\'escalade en grande voie ?',
      answer: "L'escalade en couenne, appelée escalade sportive, consiste à grimper une voie d'une seule longueur, sur une falaise ou sur une paroi artificielle (salle d'escalade) complètement équipée avec des ancrages permanents, permettant au grimpeur de s'assurer à l'aide de dégaines. Il existe des voies de tous niveaux, facile à extrêmement difficile. Idéale pour l'initiation et pour progresser.\n\nL'escalade en grande voie consiste à grimper une voie de plusieurs longueurs, sur des grandes falaises plus ou moins équipées avec des points bétons. L'objectif est d'escalader en cordée jusqu'au sommet de la falaise. Cette pratique nécessite de connaître des manipulations et techniques particulières. Il existe des grandes voies de tous niveaux, pouvant durer de la demi-journée à plusieurs jours.",
    },
    {
      question: "La différence entre l'escalade en tête et l'escalade en moulinette ?",
      answer: "L'escalade en tête consiste à grimper en contribuant à son propre assurage. En plus d'être assurer par son assureur, le grimpeur en tête doit progressivement installer les dégaines et passer sa corde dans les dégaines afin d'assurer sa sécurité en cas de chute. Il n'y a pas de corde pré-installée. Il est donc important pour le grimpeur en tête de choisir une voie adaptée à son niveau et ne pas surestimer son niveau, car il devra arriver jusqu'au relais.\n\nL'escalade en moulinette consiste à grimper sur une corde déjà installée sur la falaise. Il est donc possible, en cas de difficulté, de redescendre à tout moment.",
    },
  ]

const rotatingBenefitWords = ['progression', 'immersion', 'déconnexion', 'reconnexion'];
const activeBenefitWordIndex = ref(0);
const activeBenefitWord = computed(() => rotatingBenefitWords[activeBenefitWordIndex.value]);
const benefitCarouselIndex = ref(0);
const benefitCarouselPaused = ref(false);

let benefitInterval: ReturnType<typeof setInterval> | null = null;
let benefitCarouselInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  benefitInterval = setInterval(() => {
    activeBenefitWordIndex.value = (activeBenefitWordIndex.value + 1) % rotatingBenefitWords.length;
  }, 2500);

  benefitCarouselInterval = setInterval(() => {
    if (!benefitCarouselPaused.value) {
      benefitCarouselIndex.value = (benefitCarouselIndex.value + 1) % benefits.length;
    }
  }, 4200);
});

onBeforeUnmount(() => {
  if (benefitInterval) clearInterval(benefitInterval);
  if (benefitCarouselInterval) clearInterval(benefitCarouselInterval);
});

  const benefits = [
    {
      kicker: 'Escalade outdoor',
      title: 'Reconnecte avec le milieu naturel',
      description:
        'Découvre les milliers de spots de nos territoires en pratiquant dehors. Au soleil ou à l’ombre selon la saison, apprends à jouer avec la météo pour vivre des moments inoubliables en falaise.',
      image: '/images/reconnecte3.jpg',
    },
    {
      kicker: 'Progression',
      title: 'Émulation garantie & moniteurs diplômés',
      description:
        'Notre objectif est de te faire prendre goût à l’escalade en milieu naturel, mais surtout de te faire progresser et t’accompagner vers l’autonomie.',
      image: '/images/emulation2.jpeg',
    },
    {
      kicker: 'Club',
      title: 'Rencontre tes futurs partenaires',
      description:
        'Pas toujours simple de trouver les bonnes personnes avec qui grimper. Pendant nos stages, tu rencontres des grimpeurs et grimpeuses motivé·es pour partager la corde.',
      image: '/images/rencontre3.jpeg',
    },
    {
      kicker: 'Authenticité',
      title: 'Moniteurs locaux passionnés',
      description:
        'Nos Moniteurs aiment leur territoire et vous font découvrir les joyaux de leurs régions : plus belles voies, meilleures adresses pour manger ou dormir… tu es entre de bonnes mains.',
      image: '/images/passion5.jpeg',
    },
  ];

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
