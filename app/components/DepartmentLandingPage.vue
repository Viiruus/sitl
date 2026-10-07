<script setup lang="ts">
import type { DepartmentLandingContent } from '~/data/department-landings'
import { escaladeDepartments } from '~~/shared/data/escalade-departments'
import { guideServesDepartment } from '~~/shared/utils/seo-hubs'
import { withDepartmentStagePreviews } from '~~/shared/utils/stage-department'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const props = defineProps<{ content: DepartmentLandingContent }>()
const department = computed(() => escaladeDepartments[props.content.code])
const siteBaseUrl = resolvePublicSiteUrl(useRuntimeConfig().public.publicUrl)
const canonicalUrl = computed(() => `${siteBaseUrl}/escalade/${department.value.slug}`)

const { data: stagesData, pending: pendingStages, error: stagesError } = await useFetch('/api/aventures')
const { data: guidesData, pending: pendingGuides, error: guidesError } = await useFetch('/api/moniteurs')
const { localStages, stagesInDepartment } = await useDepartmentStages(
  computed(() => stagesData.value?.aventures ?? []), props.content.code,
)
const destinationGuideSlugs = computed(() => new Set(stagesInDepartment.value.map(stage => stage.guideSlug)))
// A published local stage also establishes that its guide works in the department.
const localGuides = computed(() =>
  (guidesData.value?.moniteurs ?? []).filter((guide: any) =>
    guideServesDepartment(guide, props.content.code) || destinationGuideSlugs.value.has(guide.slug),
  ),
)
const guideCards = computed(() => withDepartmentStagePreviews(localGuides.value, localStages.value))
const prioritizedGuides = usePrioritizedRandomMoniteurs(guideCards, `escalade-${department.value.slug}-prioritized-moniteur-ids`)
const relatedDepartments = computed(() => props.content.relatedCodes.map(code => escaladeDepartments[code]))

const structuredData = computed(() => {
  const lists = [
    {
      id: `${canonicalUrl.value}#moniteurs-locaux`,
      name: `Moniteurs d’escalade qui encadrent ${department.value.location}`,
      items: prioritizedGuides.value.map((guide: any) => ({ name: guide.fullName, url: `${siteBaseUrl}/moniteurs/${guide.slug}` })),
    },
    {
      id: `${canonicalUrl.value}#stages`,
      name: `Stages d’escalade ${department.value.location} et à proximité`,
      items: localStages.value.map(stage => ({ name: stage.titre, url: `${siteBaseUrl}/stages-escalade/${stage.slug}` })),
    },
  ].filter(list => list.items.length > 0)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage', '@id': canonicalUrl.value, url: canonicalUrl.value,
        name: props.content.seoTitle, description: props.content.seoDescription, inLanguage: 'fr-FR',
        about: { '@type': 'AdministrativeArea', name: department.value.name, identifier: props.content.code },
        mainEntity: lists.map(list => ({ '@id': list.id })),
      },
      ...lists.map(list => ({
        '@type': 'ItemList', '@id': list.id, name: list.name, numberOfItems: list.items.length,
        itemListElement: list.items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: item.url })),
      })),
    ],
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: [{ key: `escalade-${department.value.slug}-jsonld`, type: 'application/ld+json', innerHTML: JSON.stringify(structuredData.value).replace(/</g, '\\u003c') }],
}))
useSeoMeta({
  title: () => props.content.seoTitle,
  description: () => props.content.seoDescription,
  ogTitle: () => props.content.seoTitle,
  ogDescription: () => props.content.seoDescription,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => `${siteBaseUrl}${props.content.hero.image || '/images/brigade-du-kiff-falaise-escalade-hd.jpg'}`,
  robots: 'index, follow, max-image-preview:large',
})
</script>

<template>
  <div class="bg-brand-950 text-white">
    <AppHeader />
    <main>
      <section class="relative isolate overflow-hidden pt-32">
        <div class="absolute inset-0 -z-10">
          <NuxtImg v-if="content.hero.image" :src="content.hero.image" alt="" class="h-full w-full object-cover opacity-45" width="1600" height="900" fit="cover" format="webp" sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw" fetchpriority="high" loading="eager" />
          <div class="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-950/75 to-brand-950" />
        </div>
        <div class="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:pb-20 lg:px-8">
          <div class="max-w-4xl space-y-6">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">{{ content.hero.eyebrow }}</p>
            <h1 class="text-4xl font-semibold tracking-tight text-pretty sm:text-6xl">{{ content.hero.title }}</h1>
            <p class="max-w-3xl text-base leading-7 text-brand-100/85 sm:text-lg sm:leading-8">{{ content.hero.intro }}</p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="#moniteurs-locaux" class="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">Les moniteurs locaux <span aria-hidden="true">→</span></a>
              <a href="#stages" class="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Les stages à venir</a>
              <a href="#carte" class="text-sm font-semibold text-brand-100 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Voir la carte <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <div class="mx-auto max-w-7xl space-y-20 px-6 pb-20 sm:space-y-24 lg:px-8">
        <template v-for="section in content.order" :key="section">
          <section v-if="section === 'projects'" aria-labelledby="projects-title" class="space-y-8">
            <h2 id="projects-title" class="max-w-3xl text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">{{ content.projectsTitle }}</h2>
            <div class="grid gap-6 md:grid-cols-3">
              <article v-for="project in content.projects" :key="project.title" class="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-200">{{ project.eyebrow }}</p>
                <h3 class="mt-3 text-xl font-semibold">{{ project.title }}</h3>
                <p class="mt-3 flex-1 text-sm leading-6 text-brand-100/80">{{ project.description }}</p>
                <a href="#moniteurs-locaux" class="mt-5 w-fit text-sm font-semibold text-secondaryBrand-200 transition hover:text-white">{{ project.cta }} <span aria-hidden="true">→</span></a>
              </article>
            </div>
          </section>

          <section v-else-if="section === 'guides'" id="moniteurs-locaux" class="scroll-mt-32" aria-labelledby="moniteurs-title">
            <div class="grid gap-10" :class="localGuides.length === 1 ? 'lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start' : localGuides.length <= 2 ? 'lg:grid-cols-2 lg:items-start' : ''">
              <div class="max-w-3xl">
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Les moniteurs locaux</p>
                <h2 id="moniteurs-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">{{ content.guideTitle }}</h2>
                <p class="mt-5 text-base leading-7 text-brand-100/80">{{ content.guideIntro }}</p>
                <div class="mt-6 rounded-2xl border border-secondaryBrand-300/20 bg-secondaryBrand-400/5 p-6">
                  <h3 class="text-lg font-semibold text-secondaryBrand-200">Accompagnement personnalisé</h3>
                  <p class="mt-3 text-sm leading-6 text-brand-100/80">Une sortie privée, un projet d’escalade ou un programme pour progresser ? Échange avec un moniteur pour construire un accompagnement adapté à tes envies, à ton niveau et à tes objectifs.</p>
                </div>
              </div>
              <div v-if="pendingGuides" class="text-sm text-brand-100/70" role="status">Chargement des moniteurs…</div>
              <div v-else-if="guidesError" class="rounded-2xl border border-white/15 p-8 text-brand-100/80" role="status">Les profils ne sont pas disponibles pour le moment. Réessaie dans quelques instants.</div>
              <div v-else-if="!localGuides.length" class="rounded-2xl border border-dashed border-white/15 p-8 text-brand-100/80">
                <p>Aucun profil ne mentionne encore d’encadrement {{ department.location }}.</p>
                <NuxtLink to="/la-brigade" class="mt-4 inline-flex text-sm font-semibold text-secondaryBrand-200 hover:text-white">Rencontrer les moniteurs de la Brigade <span aria-hidden="true" class="ml-2">→</span></NuxtLink>
              </div>
              <ul v-else role="list" class="grid w-full justify-self-end gap-6" :class="localGuides.length === 1 ? 'max-w-sm' : localGuides.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'">
                <li v-for="guide in prioritizedGuides" :key="guide.id">
                  <GuideCard :moniteur="guide" empty-stage-label="Aucun stage local annoncé" :image-sizes="localGuides.length === 1 ? '(min-width: 432px) 352px, calc(100vw - 80px)' : '(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'" />
                </li>
              </ul>
            </div>
          </section>

          <section v-else-if="section === 'stages'" id="stages" class="scroll-mt-32 space-y-8" aria-labelledby="stages-title">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Une prochaine date, un objectif commun</p>
              <h2 id="stages-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">{{ content.stagesTitle }}</h2>
              <p class="mt-5 text-base leading-7 text-brand-100/80">{{ content.stagesIntro }}</p>
            </div>
            <div v-if="pendingStages" class="text-sm text-brand-100/70" role="status">Chargement des stages…</div>
            <div v-else-if="stagesError" class="rounded-2xl border border-white/15 p-8 text-brand-100/80" role="status">Les stages ne sont pas disponibles pour le moment. Tu peux contacter un moniteur depuis son profil.</div>
            <div v-else-if="!localStages.length" class="rounded-2xl border border-dashed border-white/15 p-8">
              <h3 class="text-xl font-semibold">Et si tu choisissais tes propres dates ?</h3>
              <p class="mt-3 text-sm leading-6 text-brand-100/80">Aucun stage à venir n’est annoncé {{ department.location }} ou à proximité pour le moment. Échange avec un moniteur local pour préparer une sortie privée selon tes envies et tes dates.</p>
              <a href="#moniteurs-locaux" class="mt-5 inline-flex text-sm font-semibold text-secondaryBrand-200 hover:text-white">Les moniteurs locaux <span aria-hidden="true" class="ml-2">→</span></a>
            </div>
            <div v-else class="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <StageCard v-for="stage in localStages" :key="stage.id" :stage="stage" heading-level="h3" image-sizes="(min-width: 1280px) 592px, (min-width: 1024px) 45vw, (min-width: 640px) 90vw, 100vw" />
            </div>
          </section>

          <section v-else-if="section === 'map'" id="carte" class="scroll-mt-32 space-y-8" aria-labelledby="carte-title">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Les lieux de ta prochaine aventure</p>
              <h2 id="carte-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">La carte de l’escalade {{ department.location }}</h2>
              <p class="mt-5 text-base leading-7 text-brand-100/80">Situe les camps de base des moniteurs et les lieux des stages. Clique sur un repère pour découvrir le profil ou le programme.</p>
            </div>
            <DepartmentLocationsMap :department-code="content.code" :guides="localGuides" :stages="localStages" />
          </section>

          <section v-else-if="section === 'areas'" aria-labelledby="territoire-title" class="space-y-8">
            <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <h2 id="territoire-title" class="text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">{{ content.areasTitle }}</h2>
              <p class="text-base leading-7 text-brand-100/80">{{ content.areasIntro }}</p>
            </div>
            <div class="grid gap-6" :class="content.areas.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'">
              <article v-for="area in content.areas" :key="area.title" class="rounded-2xl border border-white/10 p-6 sm:p-8">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-secondaryBrand-200">{{ area.eyebrow }}</p>
                <h3 class="mt-3 text-xl font-semibold">{{ area.title }}</h3>
                <p class="mt-4 text-sm leading-6 text-brand-100/80">{{ area.description }}</p>
                <p class="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-brand-100/80">{{ area.tip }}</p>
              </article>
            </div>
          </section>
        </template>

        <section aria-labelledby="faq-title" class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-300">Avant de partir</p>
            <h2 id="faq-title" class="mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">{{ content.faqTitle }}</h2>
          </div>
          <div class="divide-y divide-white/10 border-y border-white/10">
            <details v-for="item in content.faqs" :key="item.question" class="group py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">{{ item.question }}<span aria-hidden="true" class="shrink-0 text-2xl font-normal text-secondaryBrand-200 transition-transform group-open:rotate-45">+</span></summary>
              <p class="mt-4 pr-8 text-sm leading-7 text-brand-100/80">{{ item.answer }}</p>
            </details>
          </div>
        </section>
        <section class="flex flex-col items-start justify-between gap-6 rounded-3xl bg-secondaryBrand-400/10 p-8 ring-1 ring-secondaryBrand-300/20 sm:p-10 lg:flex-row lg:items-center">
          <div class="max-w-2xl">
            <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">{{ content.contactTitle }}</h2>
            <p class="mt-3 text-base leading-7 text-brand-100/80">{{ content.contactIntro }}</p>
          </div>
          <a href="#moniteurs-locaux" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">Les moniteurs locaux <span aria-hidden="true">→</span></a>
        </section>
        <nav class="border-t border-white/10 pt-8" aria-label="Autres départements où grimper">
          <p class="text-sm font-semibold text-brand-100/85">Explorer les départements voisins</p>
          <ul class="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            <li v-for="neighbor in relatedDepartments" :key="neighbor.slug"><NuxtLink :to="`/escalade/${neighbor.slug}`" class="text-sm font-semibold text-secondaryBrand-200 hover:text-white">Escalade {{ neighbor.location }} <span aria-hidden="true">→</span></NuxtLink></li>
          </ul>
        </nav>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
