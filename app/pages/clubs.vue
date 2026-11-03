<script setup lang="ts">
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const runtimeConfig = useRuntimeConfig()
const canonicalUrl = new URL('/clubs', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
const shareImage = new URL('/images/optimized/emulation2-1440.webp', canonicalUrl).toString()

useHead({ titleTemplate: '%s', link: [{ rel: 'canonical', href: canonicalUrl }] })
useSeoMeta({
  title: 'Escalade : les prestations pour les clubs | Brigade du kiff',
  description: 'Encadrement, ouverture, formations et gestion EPI : les moniteurs de la Brigade du kiff accompagnent votre club en SAE et en site naturel. Construisons votre projet.',
  ogTitle: 'Votre club. De nouveaux sommets. | Brigade du kiff',
  ogDescription: 'En salle comme en falaise, des moniteurs diplômés d’État pour accompagner les projets de votre club.',
  ogUrl: canonicalUrl,
  ogImage: shareImage,
  twitterCard: 'summary_large_image',
})

const sections = [
  { id: 'sae', label: 'SAE', detail: 'En salle' },
  { id: 'sne', label: 'SNE', detail: 'En milieu naturel' },
  { id: 'votre-projet', label: 'Votre projet', detail: 'Parlons-en' },
]
const activeSection = ref('sae')
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) activeSection.value = entry.target.id
    }
  }, { rootMargin: '-155px 0px -55% 0px', threshold: 0 })
  for (const section of sections) {
    const element = document.getElementById(section.id)
    if (element) observer.observe(element)
  }
})
onBeforeUnmount(() => observer?.disconnect())

const indoorServices = [
  {
    title: 'Encadrer & faire progresser',
    text: 'Enfants, adolescents, adultes : de la première prise au perfectionnement, des séances adaptées aux âges, aux niveaux et aux objectifs de vos adhérents.',
    tags: ['Initiation', 'Perfectionnement', 'Tous les âges'],
  },
  {
    title: 'Ouvrir de nouveaux défis',
    text: 'Ouverture de blocs et de voies pour renouveler votre mur et proposer une progression variée, pensée pour les grimpeurs de votre club.',
    tags: ['Blocs', 'Voies'],
  },
  {
    title: 'Former & valider les acquis',
    text: 'Des parcours pour reconnaître la progression de vos adhérents et préparer vos futurs encadrants.',
    tags: ['Passeports FFME', 'Compétences FFCAM', 'Initiateur SAE'],
    training: [
      {
        federation: 'FFME',
        text: 'Préparation et passage des passeports blanc, jaune et orange. Accompagnement vers le brevet d’initiateur SAE, avec un instructeur habilité pour la formation et la certification fédérales.',
      },
      {
        federation: 'FFCAM',
        text: 'Formation aux niveaux « initié » et « perfectionné » SAE, avec validation par un formateur agréé pour le niveau concerné. Formation et certification des initiateurs SAE en binôme avec un instructeur fédéral.',
      },
    ],
  },
  {
    title: 'Prendre soin de votre matériel',
    text: 'Accompagnement à la gestion des équipements de protection individuelle (EPI) : inventaire, suivi, contrôles et traçabilité du parc matériel de votre club.',
    tags: ['Gestion EPI', 'Suivi du matériel'],
  },
]
const outdoorServices = [
  {
    title: 'La falaise, pour tous les niveaux',
    text: 'Initiation et perfectionnement en groupe, en couenne sur site sportif ou en terrain d’aventure. Travailler la technique, la lecture et les manipulations pour gagner en autonomie.',
  },
  {
    title: 'Voir plus grand',
    text: 'Découvrir les grandes voies ou approfondir les techniques de progression en plusieurs longueurs : gestion de la cordée, relais, rappels et choix d’itinéraire.',
  },
  {
    title: 'Grimper sur ses propres protections',
    text: 'S’initier ou se perfectionner à l’escalade traditionnelle sur coinceurs : lecture du terrain, pose de protections et organisation de la progression.',
  },
  {
    title: 'Former & valider les acquis',
    text: 'Des formations pour gagner en autonomie sur le rocher et accompagner les encadrants de votre club.',
    training: [
      {
        federation: 'FFME',
        text: 'Préparation et évaluation des passeports vert, bleu et violet, et du module grands espaces, selon les niveaux visés et les habilitations de l’évaluateur. Accompagnement vers les brevets d’initiateur escalade (SNE), de moniteur escalade sportive et de moniteur grands espaces, avec un instructeur habilité.',
      },
      {
        federation: 'FFCAM',
        text: 'Formation aux niveaux « initié » et « perfectionné » SNE, avec validation par un formateur agréé pour le niveau concerné. Formation et certification des initiateurs SNE en binôme avec un instructeur fédéral.',
      },
    ],
  },
  {
    title: 'Transmettre les bons gestes',
    text: 'Ateliers non diplômants pour vos adhérents et bénévoles : entretien de falaise, équipement, assistance et manipulations de secours. Des contenus construits selon vos besoins et votre expérience.',
  },
]
</script>

<template>
  <div class="clubs-page min-h-screen bg-[#f7f6f2] text-brand-950">
    <AppHeader compact />
    <main id="contenu-clubs">
      <section class="overflow-hidden bg-brand-950 text-white" aria-labelledby="clubs-title">
        <div class="mx-auto grid max-w-[90rem] gap-10 px-6 pb-12 pt-36 sm:pt-40 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:px-10 lg:pb-20">
          <div class="pb-2 lg:py-6">
            <p class="eyebrow text-secondaryBrand-300">La Brigade aux côtés des clubs</p>
            <h1 id="clubs-title" class="mt-6 text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl xl:text-7xl">
              Votre club.<br>De nouveaux <span class="text-secondaryBrand-400">sommets.</span>
            </h1>
            <p class="mt-7 max-w-xl text-lg/8 text-brand-100">
              Faire progresser vos adhérents, former vos bénévoles, ouvrir de nouvelles voies.
              En salle comme en falaise, construisons la suite ensemble.
            </p>
            <a href="#votre-projet" class="primary-link mt-9">
              Parlons de votre projet <ArrowUpRightIcon class="size-5" aria-hidden="true" />
            </a>
            <p class="mt-5 text-sm/6 text-brand-200">Avec les moniteurs diplômés d’État en escalade en milieux naturels.</p>
          </div>
          <figure class="relative">
            <img
              src="/images/optimized/emulation2-1024.webp"
              srcset="/images/optimized/emulation2-768.webp 768w, /images/optimized/emulation2-1024.webp 1024w, /images/optimized/emulation2-1440.webp 1440w"
              sizes="(min-width: 1024px) 48vw, 100vw"
              width="1024" height="697" alt="Un groupe de grimpeurs réuni en plein air avec la Brigade du kiff"
              class="h-auto w-full rounded-sm" fetchpriority="high"
            >
          </figure>
        </div>
        <div class="border-t border-white/15">
          <div class="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-6 text-sm lg:px-10">
            <p class="text-brand-200">Pour votre club, quelle que soit sa fédération</p>
            <ul class="flex flex-wrap gap-x-7 gap-y-2 font-semibold" aria-label="Clubs concernés">
              <li>FFME</li><li>FFCAM</li><li class="font-normal text-brand-200">et autres fédérations</li>
            </ul>
          </div>
        </div>
      </section>

      <nav class="clubs-subnav sticky top-[88px] z-30 border-b border-brand-950/10 bg-[#f7f6f2]/95 backdrop-blur" aria-label="Prestations pour les clubs">
        <div class="mx-auto flex max-w-[90rem] px-3 sm:px-6 lg:px-10">
          <a
            v-for="section in sections" :key="section.id" :href="`#${section.id}`"
            :aria-current="activeSection === section.id ? 'location' : undefined"
            class="flex flex-1 items-center justify-center gap-3 border-b-2 px-2 py-5 text-sm font-semibold transition sm:flex-none sm:justify-start sm:px-7 sm:text-base"
            :class="activeSection === section.id ? 'border-secondaryBrand-500 text-brand-950' : 'border-transparent text-slate-600 hover:border-brand-950/20 hover:text-brand-950'"
            @click="activeSection = section.id"
          >
            {{ section.label }} <span class="hidden text-sm font-normal text-slate-600 md:inline">{{ section.detail }}</span>
          </a>
        </div>
      </nav>

      <section id="sae" class="anchor-section mx-auto max-w-[90rem] px-6 py-16 sm:py-24 lg:px-10" aria-labelledby="sae-title">
        <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div class="lg:sticky lg:top-48 lg:self-start">
            <p class="eyebrow text-slate-500">01 / Structure Artificielle d’Escalade</p>
            <p class="mt-5 text-8xl font-semibold leading-none tracking-tighter text-brand-950/10 sm:text-9xl" aria-hidden="true">SAE</p>
            <h2 id="sae-title" class="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Faites vivre<br>votre salle.</h2>
            <p class="mt-6 max-w-md text-lg/8 text-slate-600">Un coup de main ponctuel ou un accompagnement régulier : faites de votre mur un terrain de progression et de partage.</p>
            <a href="#votre-projet" class="text-link mt-7">Construire un projet en SAE <ArrowRightIcon class="size-5" aria-hidden="true" /></a>
          </div>
          <ol class="divide-y divide-brand-950/15 border-t border-brand-950/15">
            <li v-for="(service, index) in indoorServices" :key="service.title" class="flex gap-5 py-8 sm:gap-7">
              <span class="pt-1 text-sm font-medium text-slate-500" aria-hidden="true">0{{ index + 1 }}</span>
              <div>
                <h3 class="text-2xl font-semibold tracking-tight">{{ service.title }}</h3>
                <p class="mt-3 text-base/7 text-slate-600">{{ service.text }}</p>
                <dl v-if="service.training" class="mt-5 space-y-5 border-l-2 border-secondaryBrand-400 pl-4">
                  <div v-for="training in service.training" :key="training.federation">
                    <dt class="text-sm font-semibold">{{ training.federation }}</dt>
                    <dd class="mt-1 text-sm/7 text-slate-600">{{ training.text }}</dd>
                  </div>
                </dl>
                <ul class="mt-4 flex flex-wrap gap-2" aria-label="Prestations">
                  <li v-for="tag in service.tags" :key="tag" class="rounded-full border border-brand-950/15 px-3 py-1 text-xs font-medium text-slate-700">{{ tag }}</li>
                </ul>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="sne" class="anchor-section bg-brand-950 text-white" aria-labelledby="sne-title">
        <div class="mx-auto max-w-[90rem] px-6 py-16 sm:py-24 lg:px-10">
          <div class="grid items-end gap-8 lg:grid-cols-2 lg:gap-20">
            <div>
              <p class="eyebrow text-secondaryBrand-300">02 / Site Naturel d’Escalade</p>
              <h2 id="sne-title" class="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">SNE : emmenez<br>votre club <span class="text-secondaryBrand-400">dehors.</span></h2>
            </div>
            <p class="max-w-xl text-lg/8 text-brand-100">Du premier pas en falaise aux projets en terrain d’aventure, offrez à vos adhérents une expérience qui fait grandir la technique, l’autonomie et l’esprit de cordée.</p>
          </div>
          <div class="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <figure class="self-start">
              <img
                src="/images/optimized/clubs-escalade-groupe-garins-1024.webp"
                srcset="/images/optimized/clubs-escalade-groupe-garins-768.webp 768w, /images/optimized/clubs-escalade-groupe-garins-1024.webp 1024w, /images/optimized/clubs-escalade-groupe-garins-1600.webp 1600w"
                sizes="(min-width: 1024px) 40vw, 100vw"
                width="1024" height="2216" alt="Une grimpeuse en falaise aux Garins, avec un assureur et d’autres grimpeurs au pied de la voie"
                class="h-auto w-full rounded-sm" loading="lazy" decoding="async"
              >
            </figure>
            <div class="divide-y divide-white/20 border-t border-white/20">
              <article v-for="service in outdoorServices" :key="service.title" class="py-7 first:pt-6">
                <h3 class="text-2xl font-semibold tracking-tight">{{ service.title }}</h3>
                <p class="mt-3 text-base/7 text-brand-100">{{ service.text }}</p>
                <dl v-if="service.training" class="mt-5 space-y-5 border-l-2 border-secondaryBrand-400 pl-4">
                  <div v-for="training in service.training" :key="training.federation">
                    <dt class="text-sm font-semibold text-secondaryBrand-300">{{ training.federation }}</dt>
                    <dd class="mt-1 text-sm/7 text-brand-100">{{ training.text }}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </div>
          <div class="mt-10 flex flex-col items-start justify-between gap-5 border-t border-white/20 pt-7 sm:flex-row sm:items-center">
            <p class="max-w-2xl text-sm/6 text-brand-200">Sortie, week-end ou stage : le site, le format et l’effectif se définissent ensemble selon votre groupe.</p>
            <a href="#votre-projet" class="text-link shrink-0 text-secondaryBrand-300">Imaginer notre sortie <ArrowRightIcon class="size-5" aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-[90rem] px-6 py-16 sm:py-24 lg:px-10" aria-labelledby="ensemble-title">
        <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p class="eyebrow text-slate-500">Votre équipe, renforcée</p>
            <h2 id="ensemble-title" class="mt-5 text-4xl font-semibold tracking-tight">On part de<br>votre réalité.</h2>
          </div>
          <div>
            <p class="text-xl/9">Un besoin d’encadrement, une équipe de bénévoles à accompagner, un projet qui attend le bon déclic ? La Brigade intervient en complément de la vie de votre club.</p>
            <ul class="mt-7 grid gap-5 text-base/7 text-slate-600 sm:grid-cols-2">
              <li class="flex gap-3"><CheckIcon class="mt-1 size-5 shrink-0 text-brand-800" aria-hidden="true" />Des contenus adaptés à vos adhérents et à vos objectifs.</li>
              <li class="flex gap-3"><CheckIcon class="mt-1 size-5 shrink-0 text-brand-800" aria-hidden="true" />Des interventions ponctuelles ou des cycles réguliers.</li>
              <li class="flex gap-3"><CheckIcon class="mt-1 size-5 shrink-0 text-brand-800" aria-hidden="true" />Une transmission qui donne des clés à vos bénévoles.</li>
              <li class="flex gap-3"><CheckIcon class="mt-1 size-5 shrink-0 text-brand-800" aria-hidden="true" />Une organisation définie avec votre équipe.</li>
            </ul>
            <details class="mt-9 border-y border-brand-950/15 py-5">
              <summary class="cursor-pointer font-semibold">Prérogatives et formations : quel cadre d’intervention ?</summary>
              <div class="mt-4 space-y-3 text-sm/7 text-slate-600">
                <p>Les prestations sont confiées à un professionnel dont les qualifications et la carte professionnelle correspondent à l’intervention.</p>
                <p>Pour les passeports FFME, l’évaluateur doit disposer d’une licence à jour, d’un diplôme enregistré et des droits de validation correspondants. À la FFCAM, la validation des compétences des pratiquants par un professionnel nécessite un agrément « formateur FFCAM » adapté au niveau évalué.</p>
                <p>Le DEJEPS EMN ne confère pas automatiquement le titre d’instructeur FFME : les formations et certifications de cadres se montent avec un instructeur habilité. À la FFCAM, les formations et certifications d’initiateurs SAE et SNE sont conduites en binôme professionnel / instructeur fédéral, selon les règles de la fédération.</p>
                <p>Les ateliers techniques non diplômants se construisent selon vos besoins. Les interventions d’entretien et d’équipement sont définies avec le gestionnaire du site et dans le respect des autorisations locales.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section id="votre-projet" class="anchor-section border-t border-brand-950/10 bg-[#edece5]" aria-labelledby="projet-title">
        <div class="mx-auto max-w-[90rem] px-6 py-16 sm:py-24 lg:px-10">
          <div class="max-w-3xl">
            <p class="eyebrow text-slate-600">À vous de jouer</p>
            <h2 id="projet-title" class="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Et si on montait<br>un projet ensemble ?</h2>
            <p class="mt-6 max-w-md text-lg/8 text-slate-600">Dites-nous qui vous êtes et ce que vous avez en tête. Pas besoin d’avoir tout ficelé : on peut aussi partir d’une envie.</p>
            <p class="mt-7 text-sm font-semibold">Contactez-nous par email :</p>
            <a href="mailto:yo@brigadedukiff.com?subject=Projet%20club%20escalade" class="text-link mt-3 break-all text-lg sm:text-2xl">yo@brigadedukiff.com <ArrowUpRightIcon class="size-5 shrink-0" aria-hidden="true" /></a>
            <p class="mt-3 text-sm text-slate-600">Pour une question ou une demande de devis.</p>
            <NuxtLink to="/la-brigade" class="mt-8 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">Découvrir les moniteurs <ArrowRightIcon class="size-4" aria-hidden="true" /></NuxtLink>
          </div>
        </div>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.eyebrow { @apply text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm; }
.anchor-section { scroll-margin-top: 165px; }
.primary-link { @apply inline-flex items-center justify-center gap-3 rounded-sm bg-secondaryBrand-400 px-6 py-4 text-sm font-semibold text-brand-950 transition hover:bg-secondaryBrand-300; }
.text-link { @apply inline-flex items-center gap-3 text-sm font-semibold; }
.text-link:hover { @apply underline underline-offset-4; }
.clubs-page :is(a, button, summary):focus-visible { outline: 3px solid #d97706; outline-offset: 5px; }
</style>
