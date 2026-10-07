<template>
  <div class="bg-brand-950 text-white">
    <AppHeader />

    <main>
      <section class="relative isolate overflow-hidden pt-32">
        <div class="absolute inset-0 -z-10">
          <img
            src="/images/escalade-grande-voie-roc-des-boeufs-bauges.jpg"
            alt=""
            class="h-full w-full object-cover opacity-45"
            width="4000"
            height="1848"
            fetchpriority="high"
            loading="eager"
            decoding="async"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-950/75 to-brand-950" />
        </div>
        <div class="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pb-20 lg:px-8">
          <div class="max-w-4xl space-y-6">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">Annecy, Bauges et Aravis</p>
            <h1 class="text-4xl font-semibold tracking-tight text-pretty sm:text-6xl">Escalade en Haute-Savoie</h1>
            <p class="max-w-3xl text-base leading-7 text-brand-100/85 sm:text-lg sm:leading-8">
              Une parenthèse sur le rocher pendant tes vacances à Annecy, une sortie entre amis ou un cap à passer en grande voie ?
              Rencontre les moniteurs qui encadrent en Haute-Savoie et transforme ton envie en aventure.
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="#moniteurs-locaux" class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">
                Les moniteurs locaux <span aria-hidden="true">→</span>
              </a>
              <a href="#stages" class="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Les stages à venir
              </a>
            </div>
          </div>
        </div>
      </section>

      <div class="mx-auto max-w-7xl space-y-20 px-6 pb-20 sm:space-y-24 lg:px-8">
        <section id="moniteurs-locaux" class="scroll-mt-32" aria-labelledby="moniteurs-title">
          <div
            class="grid gap-10"
            :class="hauteSavoieMoniteurs.length === 1
              ? 'lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start'
              : hauteSavoieMoniteurs.length <= 2
                ? 'lg:grid-cols-2 lg:items-start'
                : ''"
          >
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Les moniteurs locaux</p>
              <h2 id="moniteurs-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
                Ton moniteur d’escalade, d’Annecy aux vallées alpines
              </h2>
              <p class="mt-5 text-base leading-7 text-brand-100/80">
                Tu habites près du lac d’Annecy ou tu viens passer quelques jours dans les Aravis ?
                Échange avec un moniteur local pour préparer une sortie adaptée à tes envies et à ton niveau.
              </p>
              <div class="mt-6 rounded-2xl border border-secondaryBrand-300/20 bg-secondaryBrand-400/5 p-6">
                <h3 class="text-lg font-semibold text-secondaryBrand-200">Tes dates, ton groupe, tes envies</h3>
                <p class="mt-3 text-sm leading-6 text-brand-100/80">
                  Une sortie privée permet de partir de ce qui compte pour toi : découvrir la falaise,
                  partager une journée en famille ou travailler un objectif précis.
                  Contacte le moniteur depuis son profil pour discuter du lieu, du format et de ses disponibilités.
                </p>
              </div>
            </div>
            <div v-if="pendingGuides" class="text-sm text-brand-100/70" role="status">Chargement des moniteurs…</div>
            <div v-else-if="guidesError" class="rounded-2xl border border-white/15 p-8 text-brand-100/80" role="status">
              Les profils ne sont pas disponibles pour le moment. Réessaie dans quelques instants.
            </div>
            <div v-else-if="!hauteSavoieMoniteurs.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-brand-100/80">
              <p>Aucun profil ne mentionne encore d’encadrement en Haute-Savoie.</p>
              <NuxtLink to="/la-brigade" class="mt-4 inline-flex text-sm font-semibold text-secondaryBrand-200 hover:text-white">
                Rencontrer les moniteurs de la Brigade <span aria-hidden="true" class="ml-2">→</span>
              </NuxtLink>
            </div>
            <ul
              v-else
              role="list"
              class="grid w-full justify-self-end gap-6"
              :class="hauteSavoieMoniteurs.length === 1
                ? 'max-w-sm'
                : hauteSavoieMoniteurs.length === 2
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'"
            >
              <li v-for="moniteur in prioritizedHauteSavoieMoniteurs" :key="moniteur.id">
                <GuideCard
                  :moniteur="moniteur"
                  empty-stage-label="Aucun stage local annoncé"
                  :image-sizes="hauteSavoieMoniteurs.length === 1
                    ? '(min-width: 432px) 352px, calc(100vw - 80px)'
                    : '(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'"
                />
              </li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="formats-title" class="space-y-8">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">À ton rythme</p>
            <h2 id="formats-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
              Quelques heures pour découvrir, plusieurs jours pour progresser
            </h2>
          </div>
          <div class="grid gap-6 md:grid-cols-3">
            <article v-for="format in climbingFormats" :key="format.title" class="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-200">{{ format.eyebrow }}</p>
              <h3 class="mt-3 text-xl font-semibold">{{ format.title }}</h3>
              <p class="mt-3 flex-1 text-sm leading-6 text-brand-100/80">{{ format.description }}</p>
              <a href="#moniteurs-locaux" class="mt-5 w-fit text-sm font-semibold text-secondaryBrand-200 transition hover:text-white">
                {{ format.cta }} <span aria-hidden="true">→</span>
              </a>
            </article>
          </div>
        </section>

        <section id="stages" class="scroll-mt-32 space-y-8" aria-labelledby="stages-title">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Un programme, une cordée, une prochaine date</p>
            <h2 id="stages-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
              Les prochains stages en Haute-Savoie et à proximité
            </h2>
            <p class="mt-5 text-base leading-7 text-brand-100/80">
              Tu préfères rejoindre un groupe avec un objectif commun ? Découvre les stages
              en Haute-Savoie et près de sa frontière, notamment dans les Bauges côté Savoie.
              Choisis les dates et le programme qui correspondent à ton projet.
            </p>
          </div>
          <div v-if="pendingStages" class="text-sm text-brand-100/70" role="status">Chargement des stages…</div>
          <div v-else-if="stagesError" class="rounded-2xl border border-white/15 p-8 text-brand-100/80" role="status">
            Les stages ne sont pas disponibles pour le moment. Tu peux échanger directement avec un moniteur depuis son profil.
          </div>
          <div v-else-if="!hauteSavoieStages.length" class="rounded-2xl border border-dashed border-white/15 p-8">
            <h3 class="text-xl font-semibold">Et si tu choisissais tes propres dates ?</h3>
            <p class="mt-3 text-sm leading-6 text-brand-100/80">
              Aucun stage à venir n’est annoncé en Haute-Savoie ou à proximité pour le moment.
              Une sortie privée peut se préparer avec un moniteur local, selon tes envies et ses disponibilités.
            </p>
            <a href="#moniteurs-locaux" class="mt-5 inline-flex text-sm font-semibold text-secondaryBrand-200 hover:text-white">
              Les moniteurs locaux <span aria-hidden="true" class="ml-2">→</span>
            </a>
          </div>
          <div v-else class="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <StageCard
              v-for="stage in hauteSavoieStages"
              :key="stage.id"
              :stage="stage"
              heading-level="h3"
              image-sizes="(min-width: 1280px) 592px, (min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </section>

        <section id="carte" class="scroll-mt-32 space-y-8" aria-labelledby="carte-title">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Autour d’Annecy et dans les vallées</p>
            <h2 id="carte-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">La carte de l’escalade en Haute-Savoie</h2>
            <p class="mt-5 text-base leading-7 text-brand-100/80">
              Situe les moniteurs et les stages pour préparer ta prochaine aventure.
              Clique sur un repère pour découvrir le profil ou le programme.
            </p>
          </div>
          <DepartmentLocationsMap department-code="74" :guides="hauteSavoieMoniteurs" :stages="hauteSavoieStages" />
        </section>

        <section aria-labelledby="territoire-title" class="space-y-8">
          <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Depuis ta ville ou ton lieu de séjour</p>
              <h2 id="territoire-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
                Où faire de l’escalade en Haute-Savoie ?
              </h2>
            </div>
            <p class="text-base leading-7 text-brand-100/80">
              Autour d’Annecy, depuis La Clusaz ou dans la vallée de Chamonix, les possibilités changent
              autant que le paysage. Ton point de départ, le temps disponible et ton expérience
              permettent de choisir une sortie qui trouve sa place dans ta journée.
            </p>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <article v-for="area in climbingAreas" :id="area.id" :key="area.id" class="scroll-mt-32 rounded-2xl border border-white/10 p-6 sm:p-8">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-200">{{ area.eyebrow }}</p>
              <h3 class="mt-3 text-xl font-semibold">{{ area.title }}</h3>
              <p class="mt-4 text-sm leading-6 text-brand-100/80">{{ area.description }}</p>
              <p class="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-brand-100/80">
                <span class="font-semibold text-white">{{ area.tipLabel }}</span> {{ area.tip }}
              </p>
            </article>
          </div>
        </section>

        <section aria-labelledby="faq-title" class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Les questions avant de partir</p>
            <h2 id="faq-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">Organiser ta sortie autour d’Annecy</h2>
            <p class="mt-5 text-base leading-7 text-brand-100/80">
              Une initiation pendant un séjour au lac ou une grande voie dans les Aravis se prépare
              à partir des mêmes repères : qui vient, d’où vous partez et ce que vous avez envie de vivre.
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
            <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Le rocher t’attend. On prépare ta sortie ?</h2>
            <p class="mt-3 text-base leading-7 text-brand-100/80">
              Partage tes dates, ton expérience et ton point de départ avec un moniteur qui encadre en Haute-Savoie.
            </p>
          </div>
          <a href="#moniteurs-locaux" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">
            Les moniteurs locaux <span aria-hidden="true">→</span>
          </a>
        </section>

        <div class="border-t border-white/10 pt-8">
          <p class="text-sm leading-6 text-brand-100/80">Envie d’explorer les falaises côté Chambéry, Aix-les-Bains ou Beaufortain ?</p>
          <NuxtLink to="/escalade/savoie" class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200 hover:text-white">
            Découvrir l’escalade en Savoie <span aria-hidden="true">→</span>
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
const canonicalUrl = `${siteBaseUrl}/escalade/haute-savoie`

const { data: stagesData, pending: pendingStages, error: stagesError } = await useFetch('/api/aventures')
const { data: guidesData, pending: pendingGuides, error: guidesError } = await useFetch('/api/moniteurs')
const { localStages: hauteSavoieStages } = await useDepartmentStages(
  computed(() => stagesData.value?.aventures ?? []), '74',
)
const hauteSavoieMoniteurs = computed(() =>
  (guidesData.value?.moniteurs ?? []).filter((moniteur: any) => guideServesDepartment(moniteur, '74')),
)
const prioritizedHauteSavoieMoniteurs = usePrioritizedRandomMoniteurs(
  computed(() => withDepartmentStagePreviews(hauteSavoieMoniteurs.value, hauteSavoieStages.value)),
  'escalade-haute-savoie-prioritized-moniteur-ids',
)

const climbingFormats = [
  {
    eyebrow: 'Un moment à partager',
    title: 'Découvrir la falaise en famille',
    description: 'Pendant un séjour au lac d’Annecy, une première sortie peut devenir un souvenir commun. Indique l’âge des enfants et les envies de chacun pour préparer une séance adaptée au groupe.',
    cta: 'Imaginer votre sortie',
  },
  {
    eyebrow: 'Après la salle',
    title: 'Trouver tes repères dehors',
    description: 'Le rocher, la lecture des prises et l’environnement changent tes habitudes. Une séance accompagnée permet de prendre tes marques en falaise et de travailler ce qui te manque pour progresser.',
    cta: 'Préparer ton passage sur le rocher',
  },
  {
    eyebrow: 'Le temps d’une aventure',
    title: 'Grimper plusieurs longueurs',
    description: 'Tu rêves d’une grande voie dans les Bauges ou les Aravis ? Parle de ton expérience en cordée et de tes objectifs pour choisir une journée découverte ou un stage de progression.',
    cta: 'Échanger sur ton objectif',
  },
]

// Local references: lac-annecy.com (Grande Jeanne, Semnoz, Talloires),
// laclusaz.com (rocher des Aravis), chamonix.com (Gaillands).
const climbingAreas = [
  {
    id: 'annecy',
    eyebrow: 'Annecy, Semnoz et rive du lac',
    title: 'Escalade autour d’Annecy : du premier contact au plaisir de grimper',
    description: 'La Grande Jeanne et le Bois Brûlé au Semnoz font partie des repères de falaise du bassin annécien. Sur la rive est du lac, Talloires-Montmin offre aussi des possibilités de découverte. Selon ton point de départ et ton niveau, ton moniteur t’aide à choisir le secteur et le rythme de la séance.',
    tipLabel: 'Pour une sortie depuis Annecy :',
    tip: 'précise où tu loges, comment tu te déplaces et le temps que tu souhaites consacrer à la grimpe.',
  },
  {
    id: 'bauges',
    eyebrow: 'Duingt, Saint-Jorioz et sud du lac',
    title: 'Les Bauges côté Haute-Savoie, entre lac et parois',
    description: 'Au sud du lac d’Annecy, le Roc des Bœufs et les reliefs autour d’Entrevernes donnent une autre dimension au paysage. Les Bauges se partagent entre Savoie et Haute-Savoie : un moniteur installé près de la frontière peut encadrer des sorties des deux côtés. Pour un projet de grande voie, discute autant de l’approche que des longueurs à grimper.',
    tipLabel: 'Pour préparer ta cordée :',
    tip: 'décris ton expérience récente et tes attentes, plutôt que de choisir uniquement à partir de la photo d’une paroi.',
  },
  {
    id: 'aravis',
    eyebrow: 'La Clusaz et Le Grand-Bornand',
    title: 'Escalade dans les Aravis : un projet à construire pendant ton séjour',
    description: 'Depuis La Clusaz, le rocher d’escalade des Aravis est un repère de falaise sur la route du col. Le massif offre aussi des itinéraires de plusieurs longueurs sur le calcaire. Si tu séjournes au Grand-Bornand ou dans la vallée, échange avec ton moniteur pour définir un terrain adapté à ton expérience et aux conditions.',
    tipLabel: 'À partager lors du premier échange :',
    tip: 'ton lieu de séjour et tes habitudes de marche en montagne, en plus de ton niveau en escalade.',
  },
  {
    id: 'chamonix',
    eyebrow: 'Chamonix et vallée de l’Arve',
    title: 'Grimper à Chamonix, avec une vraie place pour la découverte',
    description: 'Chamonix évoque les grandes montagnes, mais la falaise des Gaillands permet aussi de découvrir l’escalade près de la ville. Ce site de vallée se rejoint à pied ou en transports depuis le secteur de Chamonix. Depuis Cluses ou Sallanches, précise ton point de départ pour organiser la sortie et confirmer les secteurs d’intervention du moniteur.',
    tipLabel: 'Pour organiser le rendez-vous :',
    tip: 'distingue ton lieu d’hébergement du site où tu souhaites grimper et confirme les modalités de déplacement.',
  },
]

const frequentlyAskedQuestions = [
  {
    question: 'Peut-on organiser une sortie d’escalade depuis Annecy sans voiture ?',
    answer: 'Indique dès le premier échange ton lieu de séjour et tes possibilités de déplacement. Le moniteur pourra discuter avec toi d’un secteur et d’un rendez-vous compatibles avec ton projet. Les modalités de transport se précisent avant de réserver : elles dépendent du lieu, du format de sortie et des disponibilités.',
  },
  {
    question: 'Quel format choisir pour une première expérience en famille près du lac ?',
    answer: 'Commence par les âges des participants, leur expérience et le temps dont vous disposez. Une séance découverte se prépare avec le moniteur pour tenir compte du rythme de chacun, de la marche d’approche et du matériel. Les conditions d’accueil des enfants et l’équipement fourni sont à préciser avec lui.',
  },
  {
    question: 'Comment préparer une première grande voie dans les Bauges ou les Aravis ?',
    answer: 'Décris ce que tu pratiques déjà : moulinette ou tête, expérience sur plusieurs longueurs et aisance avec la marche d’approche. Ton moniteur pourra proposer un objectif et un format cohérents avec ces repères. Précise aussi si tu souhaites surtout vivre une découverte ou travailler les techniques pour devenir plus autonome en cordée.',
  },
]

const seoTitle = 'Escalade en Haute-Savoie : Annecy, stages & moniteurs'
const seoDescription = 'Grimpe en Haute-Savoie avec les moniteurs locaux : sorties privées autour d’Annecy, stages, initiation en falaise et grande voie dans les Bauges et les Aravis.'

const structuredData = computed(() => {
  const itemLists = [
    {
      id: `${canonicalUrl}#moniteurs-locaux`,
      name: 'Moniteurs d’escalade qui encadrent en Haute-Savoie',
      items: prioritizedHauteSavoieMoniteurs.value.map((moniteur: any) => ({
        name: moniteur.fullName,
        url: `${siteBaseUrl}/moniteurs/${moniteur.slug}`,
      })),
    },
    {
      id: `${canonicalUrl}#stages`,
      name: 'Stages d’escalade en Haute-Savoie et à proximité',
      items: hauteSavoieStages.value.map((stage: any) => ({
        name: stage.titre,
        url: `${siteBaseUrl}/stages-escalade/${stage.slug}`,
      })),
    },
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
        about: { '@type': 'AdministrativeArea', name: 'Haute-Savoie', identifier: '74' },
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
    key: 'escalade-haute-savoie-jsonld',
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
  ogImage: `${siteBaseUrl}/images/escalade-grande-voie-roc-des-boeufs-bauges.jpg`,
  robots: 'index, follow, max-image-preview:large',
})
</script>
