<template>
  <div class="bg-brand-950">
    <!-- Header réutilisable -->
    <AppHeader />

    <!-- Hero Section -->
    <div class="relative">
      <div class="mx-auto max-w-7xl">
        <div class="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
          <svg class="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-brand-950 lg:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="0,0 90,0 50,100 0,100" />
          </svg>

          <div class="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-40 lg:pr-0 2xl:py-56">
            <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <h1 class="text-5xl font-semibold tracking-tight text-pretty text-white sm:text-7xl">Vos aventures verticales commencent ici.</h1>
              <p class="mt-8 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">Escalade outdoor encadrée par nos guides locaux passionnés</p>
              <div class="mt-10 flex items-center gap-x-6">
                <a href="#" class="rounded-md bg-secondaryBrand-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">Les prochains départs</a>
                
                <NuxtLink to="/moniteur-nicolas-guillemain" class="text-sm/6 font-semibold text-white">
                  Rejoindre la communauté <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-brand-950 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img class="aspect-3/2 object-cover lg:aspect-auto lg:size-full" src="~/assets/images/escalade0.jpg" alt="" />
      </div>
    </div>
  </div>
  
    <!-- Section Bénéfices -->
  <section class="bg-brand-900 py-20 sm:py-28 text-white">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <p class="text-xs uppercase tracking-[0.5em] text-secondaryBrand-200/80">
        Notre mission ?
      </p>
      <h2 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Votre <span class="text-secondaryBrand-200">{{ activeBenefitWord }}</span>
      </h2>
      <p class="mt-4 max-w-2xl text-base text-brand-100/80">
        Des séjours imaginés pour connecter les grimpeurs à la nature, progresser avec des moniteurs diplômés
        et vivre une expérience sympa.
      </p>

      <div class="mt-12 grid gap-6 lg:grid-cols-2">
        <article
          v-for="benefit in benefits"
          :key="benefit.title"
          class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 ring-1 ring-white/10"
        >
          <div class="flex items-center gap-3 text-secondaryBrand-200">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-500/10 text-2xl">
              {{ benefit.emoji }}
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.4em] text-secondaryBrand-200/90">
                {{ benefit.kicker }}
              </p>
              <h3 class="text-xl font-semibold text-white">
                {{ benefit.title }}
              </h3>
            </div>
          </div>
          <p class="mt-4 text-sm text-brand-100/80">
            {{ benefit.description }}
          </p>
        </article>
      </div>
    </div>
  </section>

  <!-- Section Activités -->
  <section class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <p class="text-xs uppercase tracking-[0.5em] text-brand-500">
        L’escalade sous toutes ses formes
      </p>
      <h2 class="mt-4 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
        L’escalade sous toutes ses formes
      </h2>
      <p class="mt-4 max-w-2xl text-base text-gray-600">
        Chaque pratique a ses sensations. Choisis l’activité qui colle à ton envie du moment et laisse nos guides t’emmener jouer sur le rocher.
      </p>

      <div class="mt-12 grid gap-6 lg:grid-cols-2">
        <article
          v-for="activity in activities"
          :key="activity.title"
          class="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/40"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl">
              {{ activity.emoji }}
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
              class="size-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
            <div class="absolute inset-4 flex flex-col justify-between">
              <span
                class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white backdrop-blur"
              >
                {{ formatDisciplineLabel(stage.discipline) }}
              </span>
              <span class="text-sm font-semibold text-white">
                {{ stage.nextSession ? formatSessionRange(stage.nextSession) : 'Date à confirmer' }}
              </span>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-5">
            <p class="text-sm font-semibold text-secondaryBrand-300">
              {{ stage.jours }} jour{{ stage.jours > 1 ? 's' : '' }}
            </p>
            <h3 class="mt-2 text-xl font-semibold text-white">
              {{ stage.titre }}
            </h3>
            <p class="mt-1 line-clamp-2 text-sm text-brand-100/80">
              {{ stage.sousTitre }}
            </p>
            <p class="mt-3 flex items-center gap-2 text-sm text-brand-100/70">
              <svg class="h-4 w-4 text-secondaryBrand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 1 1 12 0c0 3-2 6-6 10Z" />
                <circle cx="12" cy="11" r="2.3" />
              </svg>
              {{ stage.lieuLabel }}
            </p>
            <div class="mt-4 flex items-center gap-3 text-sm text-brand-100/80">
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
            <div class="mt-6 flex items-center justify-between text-sm text-white">
              <span class="font-semibold">
                {{ stage.prixParPersonne }} € <span class="text-brand-200 text-xs">/ pers</span>
              </span>
              <span class="inline-flex items-center gap-2 text-secondaryBrand-300">
                Voir l’aventure
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>
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
    const list = (aventuresData.value?.aventures ?? []).map((stage: any) => {
      const nextDate = stage.nextSession?.dateDebut ? new Date(stage.nextSession.dateDebut) : null
      return { ...stage, nextSessionDate: nextDate }
    })

    const withNext = list
      .filter((stage: any) => stage.nextSessionDate)
      .sort((a: any, b: any) => (a.nextSessionDate as any) - (b.nextSessionDate as any))

    if (withNext.length >= 3) {
      return withNext.slice(0, 3)
    }

    return list.slice(0, 3)
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

  let benefitInterval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    benefitInterval = setInterval(() => {
      activeBenefitWordIndex.value = (activeBenefitWordIndex.value + 1) % rotatingBenefitWords.length;
    }, 2500);
  });

  onBeforeUnmount(() => {
    if (benefitInterval) clearInterval(benefitInterval);
  });

  const benefits = [
    {
      kicker: 'Escalade outdoor',
      title: 'Reconnecte avec le milieu naturel',
      description:
        'Découvre les milliers de spots de nos territoires en pratiquant dehors. Au soleil ou à l’ombre selon la saison, apprends à jouer avec la météo pour vivre des moments inoubliables en falaise.',
      emoji: '🌞',
    },
    {
      kicker: 'Progression',
      title: 'Émulation garantie & moniteurs diplômés',
      description:
        'Notre objectif est de te faire prendre goût à l’escalade en milieu naturel, mais surtout de te faire progresser et t’accompagner vers l’autonomie.',
      emoji: '📈',
    },
    {
      kicker: 'Club',
      title: 'Rencontre tes futurs partenaires',
      description:
        'Pas toujours simple de trouver les bonnes personnes avec qui grimper. Pendant nos stages, tu rencontres des grimpeurs et grimpeuses motivé·es pour partager la corde.',
      emoji: '🤝',
    },
    {
      kicker: 'Authenticité',
      title: 'Moniteurs locaux passionnés',
      description:
        'Nos Moniteurs aiment leur territoire et vous font découvrir les joyaux de leurs régions : plus belles voies, meilleures adresses pour manger ou dormir… tu es entre de bonnes mains.',
      emoji: '🧭',
    },
  ];

  const activities = [
    {
      title: 'Falaise',
      description:
        'Escalade d’une longueur aussi appelée “couenne” ou “escalade de difficulté” qui vise à gravir une paroi de 10m à 50m en s’assurant à l’aide de dégaines sur des points fixes.',
      cta: 'Les stages falaise',
      href: '/escalade-sportive-couenne-falaise',
      emoji: '🧗‍♀️',
    },
    {
      title: 'Grande voie',
      description:
        'Enchaîne plusieurs longueurs (jusqu’à plusieurs centaines de mètres) encordé·e à 2 ou 3 personnes avec matériel et techniques spécifiques : relais, rappels, assurage…',
      cta: 'Les stages grande voie',
      href: '/escalade-grande-voie',
      emoji: '🗻',
    },
    {
      title: 'Trad',
      description:
        'En escalade traditionnelle, tu places toi-même tes protections dans les faiblesses du rocher à l’aide de coinceurs, friends, pitons ou sangles.',
      cta: 'Les stages trad',
      href: '/escalade-trad',
      emoji: '🛠️',
    },
    {
      title: 'Bloc',
      description:
        'Sans corde et sur des blocs de moins de 5m, avec parade et crashpads pour amortir les chutes. Parfait pour travailler la gestuelle et la puissance.',
      cta: 'Les stages bloc',
      href: '/escalade-bloc',
      emoji: '🧱',
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
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
    const start = formatter.format(new Date(session.dateDebut))
    const end = formatter.format(new Date(session.dateFin))
    return start === end ? start : `${start} → ${end}`
  }

</script>

<style>
  html {
    scroll-behavior: smooth;
  }
</style>
