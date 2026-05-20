<template>
  <div class="bg-brand-950 text-white">
    <AppHeader />

    <main>
      <section class="relative isolate overflow-hidden pt-32">
        <div class="absolute inset-0 -z-10">
          <img
            src="/images/escalade-grande-voie-mont-peney-bauges.jpg"
            alt=""
            class="h-full w-full object-cover opacity-30"
            width="1024"
            height="1024"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-brand-950/75 via-brand-950/90 to-brand-950" />
        </div>

        <div class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div class="max-w-4xl space-y-6">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">
              Département
            </p>
            <h1 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
              Escalade en Savoie
            </h1>
            <p class="max-w-3xl text-base text-brand-100/80 sm:text-lg">
              Entre Chambéry, Aix-les-Bains, Albertville, les Bauges et les grandes vallées alpines, la Savoie offre
              un terrain de jeu majeur pour l’escalade en falaise et la grande voie. Cette page rassemble les moniteurs
              basés en Savoie et les stages qu’ils publient actuellement pour découvrir la région, progresser sur le
              rocher ou préparer un projet plus ambitieux en montagne.
            </p>
            <div class="flex flex-wrap gap-3 text-sm text-white/85">
              <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {{ savoieStages.length }} stage<span v-if="savoieStages.length > 1">s</span> lié<span v-if="savoieStages.length > 1">s</span> à la Savoie
              </span>
              <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {{ savoieMoniteurs.length }} moniteur<span v-if="savoieMoniteurs.length > 1">s</span> basé<span v-if="savoieMoniteurs.length > 1">s</span> en Savoie
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <NuxtLink
                to="/la-brigade"
                class="inline-flex items-center gap-2 rounded-md bg-secondaryBrand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400"
              >
                Voir tous les moniteurs
              </NuxtLink>
              <NuxtLink
                to="/disciplines/grande-voie"
                class="inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200 hover:text-white"
              >
                Explorer aussi la grande voie
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
                Escalade locale
              </p>
              <h2 class="text-3xl font-semibold text-white">
                Grimper en Savoie : falaises, grandes voies et accès depuis les villes alpines
              </h2>
              <p class="text-base text-brand-100/80">
                La Savoie attire autant pour ses falaises école accessibles que pour ses itinéraires plus aériens entre
                lac et montagne. Autour de Chambéry et d’Aix-les-Bains, dans les Bauges, vers Albertville ou en
                remontant les vallées de Maurienne et de Tarentaise, la région permet de construire des journées
                d’initiation, de perfectionnement ou de grande voie dans des cadres très variés.
              </p>
              <p class="text-base text-brand-100/80">
                Pour une recherche locale, cette page sert surtout à relier trois éléments utiles : des moniteurs
                réellement basés en Savoie, des stages déjà publiés sur la plateforme, et un ancrage territorial clair
                pour savoir dans quelle zone chercher selon ton projet, ton niveau et la saison.
              </p>
            </div>

            <div class="space-y-4 rounded-2xl border border-white/10 bg-brand-950/40 p-6">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Repères
              </p>
              <div class="space-y-3 text-sm text-brand-100/80">
                <p>
                  Chambéry et Aix-les-Bains : bons points d’entrée pour grimper autour du lac du Bourget, des Bauges et
                  des premières falaises savoyardes.
                </p>
                <p>
                  Albertville : accès rapide aux secteurs entre Beaufortain, Combe de Savoie et portes de la Tarentaise.
                </p>
                <p>
                  Bauges, Maurienne, Tarentaise : territoires intéressants pour mixer falaise, grandes voies et sorties
                  plus alpines selon les conditions.
                </p>
              </div>
            </div>
          </section>

          <section class="space-y-6">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Moniteurs locaux
              </p>
              <h2 class="mt-3 text-3xl font-semibold text-white">
                Moniteurs d’escalade basés en Savoie
              </h2>
            </div>

            <div v-if="pendingGuides" class="text-sm text-brand-100/70">
              Chargement des moniteurs...
            </div>
            <div v-else-if="!savoieMoniteurs.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-brand-100/70">
              Aucun profil public basé en Savoie pour le moment.
            </div>
            <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <NuxtLink
                v-for="moniteur in randomizedSavoieMoniteurs"
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

          <section class="space-y-6">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">
                Stages liés au territoire
              </p>
              <h2 class="mt-3 text-3xl font-semibold text-white">
                Stages d’escalade actuellement publiés en lien avec la Savoie
              </h2>
            </div>

            <div v-if="pendingStages" class="text-sm text-brand-100/70">
              Chargement des stages...
            </div>
            <div v-else-if="!savoieStages.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-sm text-brand-100/70">
              Aucun stage rattaché à la Savoie n’est publié pour le moment.
            </div>
            <div v-else class="grid gap-6 lg:grid-cols-3">
              <NuxtLink
                v-for="stage in savoieStages"
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
                  <StageSoldOutRibbon v-if="stage.estComplet" />
                  <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/30 to-transparent" />
                  <div class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-xs text-white">
                    <span class="inline-flex items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100">
                      {{ formatDisciplineLabel(stage.discipline) }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-white/20 bg-brand-950/60 px-3 py-1 font-semibold">
                      {{ formatDurationDays(stage.jours) }}
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
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { formatDurationDays, formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { isSavoieDepartment } from '~~/shared/utils/seo-hubs'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = resolvePublicSiteUrl(runtimeConfig.public.publicUrl)
const canonicalUrl = `${siteBaseUrl}/departements/savoie`

const { data: stagesData, pending: pendingStages } = await useFetch('/api/aventures')
const { data: guidesData, pending: pendingGuides } = await useFetch('/api/moniteurs')
const randomWeights = useState<Record<number, number>>('departement-savoie-moniteurs-order', () => ({}))

const toUpcomingTimestamp = (stage: any) => {
  const raw = stage?.nextSession?.dateDebut
  if (!raw) return Number.POSITIVE_INFINITY
  const ts = new Date(raw).getTime()
  return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts
}

const savoieMoniteurs = computed(() =>
  (guidesData.value?.moniteurs ?? []).filter((moniteur: any) => isSavoieDepartment(moniteur?.department)),
)

watch(
  () => savoieMoniteurs.value,
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

const randomizedSavoieMoniteurs = computed(() => {
  const weights = randomWeights.value
  return savoieMoniteurs.value
    .slice()
    .sort((a: any, b: any) => {
      const wA = weights[a?.id] ?? 0
      const wB = weights[b?.id] ?? 0
      return wA - wB
    })
})

const savoieStageGuideSlugs = computed(() =>
  new Set(
    savoieMoniteurs.value
      .map((moniteur: any) => moniteur?.slug)
      .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0),
  ),
)

const savoieStages = computed(() =>
  (stagesData.value?.aventures ?? []).filter((stage: any) => {
    return isSavoieDepartment(stage?.guideDepartment) || savoieStageGuideSlugs.value.has(stage?.guideSlug)
  }).slice().sort((a: any, b: any) => {
    return toUpcomingTimestamp(a) - toUpcomingTimestamp(b)
  }),
)

const seoTitle = 'Escalade en Savoie | Moniteurs locaux et stages de la Brigade du kiff'
const seoDescription =
  'Découvre l’escalade en Savoie avec des moniteurs basés autour de Chambéry, Aix-les-Bains, Albertville et des vallées alpines, ainsi que les stages publiés sur Brigade du kiff.'

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
      name: 'Départements',
      item: `${siteBaseUrl}/departements/savoie`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Savoie',
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
      key: 'departement-savoie-breadcrumb-jsonld',
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
  ogImage: `${siteBaseUrl}/images/escalade-grande-voie-mont-peney-bauges.jpg`,
  robots: 'index, follow, max-image-preview:large',
})

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Terrain d’aventure',
  VIA_FERRATA: 'Via ferrata',
}

const formatDisciplineLabel = (value?: string | null) => {
  if (!value) return 'Aventure'
  return disciplineLabels[value] ?? value
}

const stageCoverSrc = (stage: any) =>
  resolveStoredImageSrc(stage?.coverImageUrl, stage?.coverImageVariants) || '/images/escalade-grande-voie-mont-peney-bauges.jpg'

const stageCoverSrcset = (stage: any) => buildStoredSrcset(stage?.coverImageVariants)

const guideAvatarSrc = (stage: any) =>
  resolveStoredImageSrc(stage?.guideImageUrl, stage?.guideImageVariants) || '/images/escalade-grande-voie-mont-peney-bauges.jpg'

const guideAvatarSrcset = (stage: any) => buildStoredSrcset(stage?.guideImageVariants)

const profileImageFor = (moniteur: any) =>
  resolveStoredImageSrc(moniteur?.profileImageUrl, moniteur?.profileImageVariants) || '/images/escalade-grande-voie-mont-peney-bauges.jpg'

const profileImageSrcset = (moniteur: any) => buildStoredSrcset(moniteur?.profileImageVariants)

const bioSnippet = (bio?: string | null) => {
  if (!bio) return 'Bio à venir.'
  return bio.length > 180 ? `${bio.slice(0, 180).trimEnd()}…` : bio
}

const formatSessionRange = (session: any) =>
  formatSessionRangeLabel(session?.dateDebut, session?.dateFin) || 'Date à confirmer'
</script>
