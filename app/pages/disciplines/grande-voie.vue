<template>
  <div class="bg-brand-950 text-white">
    <AppHeader />

    <main>
      <section class="relative isolate overflow-hidden pt-32">
        <div class="absolute inset-0 -z-10">
          <img
            src="/images/escalade-grande-voie-calanques.jpg"
            alt=""
            class="h-full w-full object-cover opacity-30"
            width="1792"
            height="1024"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-950/90 to-brand-950" />
        </div>

        <div class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div class="max-w-4xl space-y-6">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">
              Discipline
            </p>
            <h1 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
              Stages d’escalade en grande voie
            </h1>
            <p class="max-w-3xl text-base text-brand-100/80 sm:text-lg">
              La grande voie, c’est l’escalade en plusieurs longueurs : gestion de la corde, relais, lecture
              d’itinéraire, engagement progressif et découverte de parois plus amples. Cette page rassemble les stages
              publiés autour de cette pratique, ainsi que les moniteurs qui encadrent des sorties de découverte,
              d’initiation ou de perfectionnement en grande voie.
            </p>
            <div class="flex flex-wrap gap-3 text-sm text-white/85">
              <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {{ grandeVoieStages.length }} stage<span v-if="grandeVoieStages.length > 1">s</span> à venir
              </span>
              <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {{ grandeVoieMoniteurs.length }} moniteur<span v-if="grandeVoieMoniteurs.length > 1">s</span> concerné<span v-if="grandeVoieMoniteurs.length > 1">s</span>
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <NuxtLink
                to="/stages-escalade?discipline=GRANDE_VOIE"
                class="inline-flex items-center gap-2 rounded-md bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400"
              >
                Voir tous les stages grande voie
              </NuxtLink>
              <NuxtLink
                to="/departements/savoie"
                class="inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200 hover:text-white"
              >
                Explorer aussi la Savoie
                <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-brand-950 py-16">
        <div class="mx-auto max-w-7xl space-y-16 px-6 lg:px-8">
          <section class="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 ring-1 ring-white/10 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-5">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Pratique
              </p>
              <h2 class="text-3xl font-semibold text-white">
                Comprendre la grande voie : progression, autonomie et terrain d’aventure vertical
              </h2>
              <p class="text-base text-brand-100/80">
                Chercher un stage grande voie, ce n’est pas seulement chercher une sortie en falaise plus longue. C’est
                souvent vouloir apprendre à évoluer sur plusieurs longueurs, construire une cordée plus autonome,
                améliorer ses manips de relais, gérer la descente en rappel et gagner en fluidité dans un terrain plus
                vertical et plus engagé.
              </p>
              <p class="text-base text-brand-100/80">
                Selon le niveau, la pratique peut prendre la forme d’une première journée découverte, d’un stage
                d’initiation, d’un séjour de progression ou d’un projet plus ambitieux sur des parois classiques. Cette
                page sert à rassembler les stages déjà publiés et les profils de moniteurs associés à cette discipline.
              </p>
            </div>

            <div class="space-y-4 rounded-2xl border border-white/10 bg-brand-950/40 p-6">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Recherches fréquentes
              </p>
              <div class="space-y-3 text-sm text-brand-100/80">
                <p>
                  Initiation grande voie : pour découvrir les voies de plusieurs longueurs avec un cadre plus pédagogique et plus
                  progressif.
                </p>
                <p>
                  Stage de perfectionnement : pour travailler la pose au relais, la gestion de corde, l’assurage du
                  second et la fluidité de cordée.
                </p>
                <p>
                  Sortie encadrée : pour grimper une grande voie adaptée au niveau du groupe, dans une logique plaisir,
                  progression ou préparation d’objectifs futurs.
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-6">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Prochains départs
              </p>
              <h2 class="mt-3 text-3xl font-semibold text-white">
                Stages grande voie publiés en ce moment
              </h2>
            </div>

            <div v-if="pendingStages" class="text-sm text-brand-100/70">
              Chargement des stages...
            </div>
            <div v-else-if="!grandeVoieStages.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-brand-100/70">
              Aucun stage grande voie à venir pour le moment.
            </div>
            <div v-else class="grid gap-6 lg:grid-cols-3">
              <NuxtLink
                v-for="stage in grandeVoieStages"
                :key="stage.id"
                :to="`/stages-escalade/${stage.slug}`"
                class="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div class="relative h-56">
                  <img
                    :src="stageCoverSrc(stage)"
                    :srcset="stageCoverSrcset(stage)"
                    :alt="stage.titre"
                    class="size-full object-cover transition duration-500 group-hover:scale-105"
                    decoding="async"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/30 to-transparent" />
                  <div class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-xs text-white">
                    <span class="inline-flex items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100">
                      Grande voie
                    </span>
                    <span class="inline-flex items-center rounded-full border border-white/20 bg-brand-950/60 px-3 py-1 font-semibold">
                      {{ stage.jours }} {{ stage.jours > 1 ? 'jours' : 'jour' }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h3 class="text-xl font-semibold text-white">
                      {{ stage.titre }}
                    </h3>
                    <p v-if="stage.sousTitre" class="mt-2 text-sm text-brand-100/80">
                      {{ stage.sousTitre }}
                    </p>
                  </div>
                  <div class="space-y-2 text-sm text-brand-100/85">
                    <p>{{ stage.lieuLabel }}</p>
                    <p>{{ stage.nextSession ? formatSessionRange(stage.nextSession) : 'Date à confirmer' }}</p>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-4 text-sm text-white">
                    <div class="flex items-center gap-3">
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
                        <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Moniteur</p>
                        <p class="font-semibold text-white">{{ stage.guideName || 'Moniteur local' }}</p>
                      </div>
                    </div>
                    <span class="font-semibold">{{ stage.prixParPersonne }} €</span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </section>

          <section class="space-y-6">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Moniteurs
              </p>
              <h2 class="mt-3 text-3xl font-semibold text-white">
                Moniteurs qui encadrent la grande voie
              </h2>
            </div>

            <div v-if="pendingGuides" class="text-sm text-brand-100/70">
              Chargement des moniteurs...
            </div>
            <div v-else-if="!grandeVoieMoniteurs.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-brand-100/70">
              Aucun profil moniteur grande voie n’est disponible pour le moment.
            </div>
            <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <NuxtLink
                v-for="moniteur in randomizedGrandeVoieMoniteurs"
                :key="moniteur.id"
                :to="`/moniteurs/${moniteur.slug}`"
                class="group flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div class="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <img
                    :src="profileImageFor(moniteur)"
                    :srcset="profileImageSrcset(moniteur)"
                    :alt="moniteur.fullName"
                    class="size-full object-cover transition duration-500 group-hover:scale-105"
                    decoding="async"
                    sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                    loading="lazy"
                  />
                </div>
                <div class="space-y-3">
                  <div>
                    <h3 class="text-lg font-semibold text-white group-hover:text-secondaryBrand-200">
                      {{ moniteur.fullName }}
                    </h3>
                    <p class="text-xs uppercase tracking-[0.3em] text-secondaryBrand-200/80">
                      {{ moniteur.baseLocation }}
                    </p>
                  </div>
                  <p class="text-sm text-brand-100/80">
                    {{ bioSnippet(moniteur.bio) }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </section>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = resolvePublicSiteUrl(runtimeConfig.public.publicUrl)
const canonicalUrl = `${siteBaseUrl}/disciplines/grande-voie`

const { data: stagesData, pending: pendingStages } = await useFetch('/api/aventures')
const { data: guidesData, pending: pendingGuides } = await useFetch('/api/moniteurs')
const randomWeights = useState<Record<number, number>>('discipline-grande-voie-moniteurs-order', () => ({}))

const toUpcomingTimestamp = (stage: any) => {
  const raw = stage?.nextSession?.dateDebut
  if (!raw) return Number.POSITIVE_INFINITY
  const ts = new Date(raw).getTime()
  return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts
}

const grandeVoieStages = computed(() =>
  (stagesData.value?.aventures ?? [])
    .filter((stage: any) => stage?.discipline === 'GRANDE_VOIE')
    .slice()
    .sort((a: any, b: any) => toUpcomingTimestamp(a) - toUpcomingTimestamp(b)),
)

const stageGuideSlugs = computed(() =>
  new Set(
    grandeVoieStages.value
      .map((stage: any) => stage?.guideSlug)
      .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0),
  ),
)

const grandeVoieMoniteurs = computed(() =>
  (guidesData.value?.moniteurs ?? []).filter((moniteur: any) => {
    const disciplines = Array.isArray(moniteur?.disciplines) ? moniteur.disciplines : []
    return disciplines.includes('GRANDE_VOIE') || stageGuideSlugs.value.has(moniteur.slug)
  }),
)

watch(
  () => grandeVoieMoniteurs.value,
  (list) => {
    if (!list.length) {
      randomWeights.value = {}
      return
    }
    list.forEach((moniteur: any) => {
      const key = moniteur?.id
      if (key == null) return
      if (randomWeights.value[key] === undefined) {
        randomWeights.value[key] = Math.random()
      }
    })
  },
  { immediate: true, deep: true },
)

const randomizedGrandeVoieMoniteurs = computed(() => {
  const weights = randomWeights.value
  return grandeVoieMoniteurs.value
    .slice()
    .sort((a: any, b: any) => {
      const wA = weights[a?.id] ?? 0
      const wB = weights[b?.id] ?? 0
      return wA - wB
    })
})

const seoTitle = 'Stages grande voie | Moniteurs et aventures de la Brigade du kiff'
const seoDescription =
  'Découvre les stages d’escalade en grande voie, les sorties en plusieurs longueurs et les moniteurs qui encadrent l’initiation ou le perfectionnement sur Brigade du kiff.'

const breadcrumbStructuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: `${siteBaseUrl}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Disciplines',
      item: `${siteBaseUrl}/disciplines/grande-voie`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Grande voie',
      item: canonicalUrl,
    },
  ],
}))

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  script: [
    {
      key: 'discipline-grande-voie-breadcrumb-jsonld',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbStructuredData.value),
    },
  ],
})

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogUrl: canonicalUrl,
  ogImage: `${siteBaseUrl}/images/escalade-grande-voie-calanques.jpg`,
  robots: 'index, follow, max-image-preview:large',
})

const stageCoverSrc = (stage: any) =>
  resolveStoredImageSrc(stage?.coverImageUrl, stage?.coverImageVariants) || '/images/escalade-grande-voie-calanques.jpg'

const stageCoverSrcset = (stage: any) => buildStoredSrcset(stage?.coverImageVariants)

const guideAvatarSrc = (stage: any) =>
  resolveStoredImageSrc(stage?.guideImageUrl, stage?.guideImageVariants) || '/images/escalade-grande-voie-calanques.jpg'

const guideAvatarSrcset = (stage: any) => buildStoredSrcset(stage?.guideImageVariants)

const profileImageFor = (moniteur: any) =>
  resolveStoredImageSrc(moniteur?.profileImageUrl, moniteur?.profileImageVariants) || '/images/escalade-grande-voie-calanques.jpg'

const profileImageSrcset = (moniteur: any) => buildStoredSrcset(moniteur?.profileImageVariants)

const bioSnippet = (bio?: string | null) => {
  if (!bio) return 'Bio à venir.'
  return bio.length > 180 ? `${bio.slice(0, 180).trimEnd()}…` : bio
}

const formatSessionRange = (session: any) => {
  if (!session?.dateDebut) return 'Date à confirmer'
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const start = formatter.format(new Date(session.dateDebut))
  if (!session?.dateFin) return start
  const end = formatter.format(new Date(session.dateFin))
  return start === end ? start : `${start} → ${end}`
}
</script>
