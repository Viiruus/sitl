<template>
  <div class="bg-brand-950 text-white">
    <AppHeader />

    <main>
      <section class="relative isolate overflow-hidden pt-32">
        <div class="absolute inset-0 -z-10">
          <img
            src="/images/escalade-grande-voie-mont-peney-bauges.jpg"
            alt=""
            class="h-full w-full object-cover opacity-45"
            width="1024"
            height="1024"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-950/75 to-brand-950" />
        </div>

        <div class="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pb-20 lg:px-8">
          <div class="max-w-4xl space-y-6">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">
              Entre lac du Bourget et sommets des Bauges
            </p>
            <h1 class="text-4xl font-semibold tracking-tight text-pretty sm:text-6xl">
              Escalade en Savoie<br class="hidden sm:block" />
              avec les moniteurs locaux
            </h1>
            <p class="max-w-3xl text-base leading-7 text-brand-100/85 sm:text-lg sm:leading-8">
              Ta première sortie en falaise, une grande voie dans les Bauges ou un stage pour progresser ?
              De Chambéry à Aix-les-Bains et Albertville, rencontre les moniteurs d’escalade qui encadrent en Savoie
              et prépare une aventure à ta mesure.
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#moniteurs-locaux"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300"
              >
                Les moniteurs locaux
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="#stages"
                class="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Les stages à venir
              </a>
            </div>
          </div>
        </div>
      </section>

      <div class="mx-auto max-w-7xl space-y-20 px-6 pb-20 sm:space-y-24 lg:px-8">
        <section aria-labelledby="envies-title">
          <h2 id="envies-title" class="sr-only">Quelle sortie d’escalade te ferait plaisir ?</h2>
          <div class="grid gap-6 md:grid-cols-3">
            <article
              v-for="project in climbingProjects"
              :key="project.title"
              class="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-200">{{ project.eyebrow }}</p>
              <h3 class="mt-3 text-xl font-semibold">{{ project.title }}</h3>
              <p class="mt-3 flex-1 text-sm leading-6 text-brand-100/80">{{ project.description }}</p>
              <a href="#moniteurs-locaux" class="mt-5 w-fit text-sm font-semibold text-secondaryBrand-200 transition hover:text-white">
                {{ project.cta }} <span aria-hidden="true">→</span>
              </a>
            </article>
          </div>
        </section>

        <section id="moniteurs-locaux" class="scroll-mt-32" aria-labelledby="moniteurs-title">
          <div
            class="grid gap-10"
            :class="savoieMoniteurs.length === 1
              ? 'lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start'
              : savoieMoniteurs.length <= 2
                ? 'lg:grid-cols-2 lg:items-start'
                : ''"
          >
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Les moniteurs locaux</p>
              <h2 id="moniteurs-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
                Trouve ton moniteur d’escalade en Savoie
              </h2>
              <p class="mt-5 text-base leading-7 text-brand-100/80">
                Derrière chaque profil, une personne avec son camp de base, ses terrains de prédilection
                et sa façon de transmettre. Découvre son univers, puis échange directement avec elle
                pour choisir un secteur et un format adaptés à ton niveau.
              </p>
              <div class="mt-6 rounded-2xl border border-secondaryBrand-300/20 bg-secondaryBrand-400/5 p-6">
                <h3 class="text-lg font-semibold text-secondaryBrand-200">Une sortie privée ou un projet sur mesure ?</h3>
                <p class="mt-3 text-sm leading-6 text-brand-100/80">
                  Pas besoin d’attendre un stage aux bonnes dates. Ouvre le profil d’un moniteur et utilise
                  le bouton de contact pour lui parler de tes envies, de tes disponibilités et de ton lieu
                  de séjour. Vous pourrez construire ensemble ton accompagnement.
                </p>
              </div>
            </div>

            <div v-if="pendingGuides" class="text-sm text-brand-100/70" role="status">Chargement des moniteurs…</div>
            <div v-else-if="guidesError" class="rounded-2xl border border-white/15 p-8 text-brand-100/80" role="status">
              Les profils ne sont pas disponibles pour le moment. Réessaie dans quelques instants.
            </div>
            <div v-else-if="!savoieMoniteurs.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-brand-100/80">
              <p>Les profils des moniteurs qui encadrent en Savoie seront bientôt disponibles.</p>
              <NuxtLink to="/la-brigade" class="mt-4 inline-flex text-sm font-semibold text-secondaryBrand-200 hover:text-white">
                Rencontrer la Brigade <span aria-hidden="true" class="ml-2">→</span>
              </NuxtLink>
            </div>
            <ul
              v-else
              role="list"
              class="grid w-full justify-self-end gap-6"
              :class="savoieMoniteurs.length === 1
                ? 'max-w-sm'
                : savoieMoniteurs.length === 2
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'"
            >
              <li v-for="moniteur in prioritizedSavoieMoniteurs" :key="moniteur.id">
                <GuideCard
                  :moniteur="moniteur"
                  empty-stage-label="Aucun stage local annoncé"
                  :image-sizes="savoieMoniteurs.length === 1
                    ? '(min-width: 432px) 352px, calc(100vw - 80px)'
                    : '(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'"
                />
              </li>
            </ul>
          </div>
        </section>

        <section id="stages" class="scroll-mt-32 space-y-8" aria-labelledby="stages-title">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Choisis ta prochaine aventure</p>
            <h2 id="stages-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
              Les stages d’escalade en Savoie et à proximité
            </h2>
            <p class="mt-5 text-base leading-7 text-brand-100/80">
              Envie de consacrer du temps à ta progression ? Découvre les stages qui se déroulent
              en Savoie ou près de ses frontières. Consulte les dates, le programme et les prérequis
              pour choisir ton prochain rendez-vous sur le rocher.
            </p>
          </div>

          <div v-if="pendingStages" class="text-sm text-brand-100/70" role="status">Chargement des stages…</div>
          <div v-else-if="stagesError" class="rounded-2xl border border-white/15 p-8 text-brand-100/80" role="status">
            Les dates ne sont pas disponibles pour le moment. Tu peux contacter un moniteur depuis son profil.
          </div>
          <div v-else-if="!savoieStages.length" class="rounded-2xl border border-dashed border-white/15 p-8">
            <h3 class="text-xl font-semibold">Ton projet n’a pas besoin d’attendre une date de stage</h3>
            <p class="mt-3 text-sm leading-6 text-brand-100/80">
              Aucun stage à venir n’est annoncé en Savoie ou à proximité pour le moment.
              Échange avec un moniteur local pour préparer une sortie privée ou un accompagnement personnalisé.
            </p>
            <a href="#moniteurs-locaux" class="mt-5 inline-flex text-sm font-semibold text-secondaryBrand-200 hover:text-white">
              Les moniteurs locaux <span aria-hidden="true" class="ml-2">→</span>
            </a>
          </div>
          <div v-else class="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <StageCard
              v-for="stage in savoieStages"
              :key="stage.id"
              :stage="stage"
              heading-level="h3"
              image-sizes="(min-width: 1280px) 592px, (min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </section>

        <section id="carte" class="scroll-mt-32 space-y-8" aria-labelledby="carte-title">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Les lieux de ta prochaine sortie</p>
            <h2 id="carte-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">La carte de l’escalade en Savoie</h2>
            <p class="mt-5 text-base leading-7 text-brand-100/80">
              Repère le camp de base des moniteurs et les lieux des stages.
              Clique sur un repère pour découvrir le profil ou le programme.
            </p>
          </div>
          <DepartmentLocationsMap department-code="73" :guides="savoieMoniteurs" :stages="savoieStages" />
        </section>

        <section aria-labelledby="territoire-title" class="space-y-8">
          <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Ton terrain de jeu</p>
              <h2 id="territoire-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
                Où grimper en Savoie ? Du calcaire des Bauges aux parois du Beaufortain
              </h2>
            </div>
            <p class="text-base leading-7 text-brand-100/80">
              Une falaise près du lac et une grande voie en altitude ne demandent pas la même journée.
              Voici quelques repères pour imaginer ta sortie. Le choix du site se précise avec ton moniteur,
              selon ton expérience, l’approche et les conditions du moment.
            </p>
          </div>
          <div class="grid gap-6 md:grid-cols-3">
            <article v-for="area in climbingAreas" :key="area.title" class="rounded-2xl border border-white/10 p-6">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-200">{{ area.eyebrow }}</p>
              <h3 class="mt-3 text-xl font-semibold">{{ area.title }}</h3>
              <p class="mt-4 text-sm leading-6 text-brand-100/80">{{ area.description }}</p>
              <p class="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-brand-100/80">
                <span class="font-semibold text-white">{{ area.tipLabel }}</span> {{ area.tip }}
              </p>
            </article>
          </div>
          <p class="max-w-4xl text-sm leading-6 text-brand-100/75">
            Tu séjournes en Maurienne ou en Tarentaise ? Précise ta vallée et ta mobilité lors de ton premier échange.
            Le camp de base affiché sur un profil est un point de repère : confirme avec le moniteur
            les secteurs dans lesquels il propose de l’encadrement.
          </p>
        </section>

        <section aria-labelledby="faq-title" class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Prépare ta sortie</p>
            <h2 id="faq-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
              Avant de chausser en Savoie
            </h2>
            <p class="mt-5 text-base leading-7 text-brand-100/80">
              Ton niveau, tes dates et ton point de départ sont les meilleurs ingrédients pour préparer
              une journée qui te ressemble.
            </p>
          </div>
          <div class="divide-y divide-white/10 border-y border-white/10">
            <details v-for="item in frequentlyAskedQuestions" :key="item.question" class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
                {{ item.question }}
                <span aria-hidden="true" class="shrink-0 text-2xl font-normal text-secondaryBrand-200 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p class="mt-4 pr-8 text-sm leading-7 text-brand-100/80">{{ item.answer }}</p>
            </details>
          </div>
        </section>

        <section class="flex flex-col items-start justify-between gap-6 rounded-3xl bg-secondaryBrand-400/10 p-8 ring-1 ring-secondaryBrand-300/20 sm:p-10 lg:flex-row lg:items-center">
          <div class="max-w-2xl">
            <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Le prochain pas, c’est de parler de ton projet.</h2>
            <p class="mt-3 text-base leading-7 text-brand-100/80">
              Une envie, un niveau, quelques dates : contacte un moniteur local et donne forme à ta prochaine sortie en Savoie.
            </p>
          </div>
          <a href="#moniteurs-locaux" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">
            Les moniteurs locaux <span aria-hidden="true">→</span>
          </a>
        </section>

        <div class="border-t border-white/10 pt-8">
          <p class="text-sm leading-6 text-brand-100/80">Ton projet t’emmène de l’autre côté des Bauges, vers Annecy ?</p>
          <NuxtLink to="/escalade/haute-savoie" class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200 hover:text-white">
            Découvrir l’escalade en Haute-Savoie <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { guideServesDepartment } from '~~/shared/utils/seo-hubs'
import { withDepartmentStagePreviews } from '~~/shared/utils/stage-department'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = resolvePublicSiteUrl(runtimeConfig.public.publicUrl)
const canonicalUrl = `${siteBaseUrl}/escalade/savoie`

const { data: stagesData, pending: pendingStages, error: stagesError } = await useFetch('/api/aventures')
const { data: guidesData, pending: pendingGuides, error: guidesError } = await useFetch('/api/moniteurs')
const { localStages: savoieStages } = await useDepartmentStages(
  computed(() => stagesData.value?.aventures ?? []), '73',
)

const savoieMoniteurs = computed(() =>
  (guidesData.value?.moniteurs ?? []).filter((moniteur: any) => guideServesDepartment(moniteur, '73')),
)

const prioritizedSavoieMoniteurs = usePrioritizedRandomMoniteurs(
  computed(() => withDepartmentStagePreviews(savoieMoniteurs.value, savoieStages.value)),
  'escalade-savoie-prioritized-moniteur-ids',
)

// This editorial content belongs to Savoie. Future department pages
// should describe their own terrain and visitor needs rather than swap names.
const climbingProjects = [
  {
    eyebrow: 'Découvrir',
    title: 'Tes premiers pas sur le rocher',
    description: 'Envie de sortir de la salle ou de tenter l’escalade pour la première fois ? Prépare une initiation en falaise, avec un terrain et un rythme adaptés à ton expérience.',
    cta: 'Préparer une première sortie',
  },
  {
    eyebrow: 'Progresser',
    title: 'Un cap à passer en falaise',
    description: 'Grimper en tête, mieux lire une voie ou retrouver de la confiance : partage ton objectif pour choisir un stage ou un accompagnement personnalisé.',
    cta: 'Parler de tes objectifs',
  },
  {
    eyebrow: 'Prendre de la hauteur',
    title: 'Une envie de grande voie',
    description: 'Plusieurs longueurs, une cordée et une autre perspective sur les Bauges. Échange avec un moniteur pour préparer une découverte ou travailler ton autonomie en grande voie.',
    cta: 'Construire ton projet',
  },
]

const climbingAreas = [
  {
    eyebrow: 'Chambéry et massif des Bauges',
    title: 'Escalade autour de Chambéry et dans les Bauges',
    description: 'Autour de Chambéry, les sites de Saint-Alban-Leysse ouvrent la porte à l’escalade en falaise. Plus au cœur des Bauges, Le Coudray à Jarsy offre un autre cadre pour grimper sur le calcaire. Le mont Peney fait aussi partie des repères du massif pour les voies de plusieurs longueurs.',
    tipLabel: 'À préciser :',
    tip: 'une envie de couenne ou de grande voie, et ton aisance avec la marche d’approche.',
  },
  {
    eyebrow: 'Aix-les-Bains et lac du Bourget',
    title: 'Escalade autour d’Aix-les-Bains et du lac du Bourget',
    description: 'Les secteurs de Brison et de Cessens, ainsi que la Pierre du Quart à Chindrieux, font partie du paysage de grimpe autour du lac du Bourget. Le secteur se choisit aussi selon l’orientation de la paroi et ton niveau : une belle vue ne suffit pas à faire la bonne sortie.',
    tipLabel: 'Le bon point de départ :',
    tip: 'indique où tu séjournes autour du lac pour organiser le rendez-vous avec ton moniteur.',
  },
  {
    eyebrow: 'Albertville et Beaufortain',
    title: 'Escalade autour d’Albertville et dans le Beaufortain',
    description: 'En remontant d’Albertville vers Beaufort, le rocher école Roger Frison-Roche est un repère pour découvrir la falaise. Plus haut, la Pierra Menta illustre une autre facette du Beaufortain : des grandes voies en montagne, où l’approche et l’altitude prennent davantage de place dans le projet.',
    tipLabel: 'Pour construire ta journée :',
    tip: 'parle autant de ton expérience en escalade que de ta condition physique et du temps dont tu disposes.',
  },
]

const frequentlyAskedQuestions = [
  {
    question: 'Peut-on découvrir l’escalade en Savoie sans avoir grimpé en salle ?',
    answer: 'Tu peux préparer une première sortie en falaise sans expérience en salle. Indique au moniteur que tu débutes, l’âge des participants et tes éventuelles appréhensions. Il pourra te proposer un format adapté ; les stages avec des prérequis sont à vérifier sur leur fiche.',
  },
  {
    question: 'Faut-il choisir un stage ou une sortie privée ?',
    answer: 'Un stage suit un programme et des dates déjà publiés : c’est une bonne option si ses objectifs correspondent aux tiens. Une sortie privée se construit directement avec le moniteur, à partir de tes disponibilités et de ton projet. Le tarif, le matériel et le rendez-vous se précisent avec lui.',
  },
  {
    question: 'Comment choisir entre falaise près du lac et grande voie dans les Bauges ?',
    answer: 'Commence par ton envie et ton expérience, plutôt que par un sommet ou une photo. Une séance en falaise permet de travailler sur des voies d’une longueur ; une grande voie ajoute la progression en cordée sur plusieurs longueurs et la gestion de la descente. Ton moniteur t’aide à choisir un objectif cohérent avec ton niveau.',
  },
  {
    question: 'Quelles informations envoyer pour organiser une sortie depuis Chambéry ou Aix-les-Bains ?',
    answer: 'Précise tes dates, ton lieu de séjour, si tu disposes d’un véhicule, le nombre de participants et ton expérience récente en escalade. Ajoute tes envies : découvrir, progresser en tête ou essayer la grande voie. Ces repères permettent au moniteur de discuter d’un secteur, de l’approche et du matériel à prévoir.',
  },
]

const seoTitle = 'Escalade en Savoie (73) : moniteurs locaux & stages'
const seoDescription = 'Prépare ta sortie d’escalade en Savoie : moniteurs locaux, stages et accompagnement sur mesure autour de Chambéry, Aix-les-Bains, des Bauges et du Beaufortain.'

const structuredData = computed(() => {
  const guideListId = `${canonicalUrl}#moniteurs-locaux`
  const stageListId = `${canonicalUrl}#stages`
  const guideItems = prioritizedSavoieMoniteurs.value.map((moniteur: any) => ({
    name: moniteur.fullName,
    url: `${siteBaseUrl}/moniteurs/${moniteur.slug}`,
  }))
  const stageItems = savoieStages.value.map((stage: any) => ({
    name: stage.titre,
    url: `${siteBaseUrl}/stages-escalade/${stage.slug}`,
  }))
  const itemLists = [
    { id: guideListId, name: 'Moniteurs d’escalade qui encadrent en Savoie', items: guideItems },
    { id: stageListId, name: 'Stages d’escalade en Savoie et à proximité', items: stageItems },
  ].filter(list => list.items.length > 0)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: seoTitle,
        description: seoDescription,
        inLanguage: 'fr-FR',
        about: { '@type': 'AdministrativeArea', name: 'Savoie', identifier: '73' },
        mainEntity: itemLists.map(list => ({ '@id': list.id })),
      },
      ...itemLists.map(list => ({
        '@type': 'ItemList',
        '@id': list.id,
        name: list.name,
        numberOfItems: list.items.length,
        itemListElement: list.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
        })),
      })),
    ],
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    key: 'escalade-savoie-jsonld',
    type: 'application/ld+json',
    innerHTML: JSON.stringify(structuredData.value).replace(/</g, '\\u003c'),
  }],
}))

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogUrl: canonicalUrl,
  ogImage: `${siteBaseUrl}/images/escalade-grande-voie-mont-peney-bauges.jpg`,
  robots: 'index, follow, max-image-preview:large',
})
</script>
