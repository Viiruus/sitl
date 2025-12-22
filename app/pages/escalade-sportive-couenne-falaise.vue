<template>
  <div class="bg-brand-950 text-white">
    <AppHeader />

    <main>
      <section class="relative isolate">
        <svg class="absolute inset-x-0 top-0 -z-10 h-[40rem] w-full mask-[radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-white/10" aria-hidden="true">
          <defs>
            <pattern id="hero-grid" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y="-1" class="overflow-visible fill-brand-900/60">
            <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" stroke-width="0" />
          </svg>
          <rect width="100%" height="100%" stroke-width="0" fill="url(#hero-grid)" />
        </svg>
        <div class="absolute top-0 right-0 left-1/2 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48" aria-hidden="true">
          <div class="aspect-[801/1036] w-[50rem] bg-gradient-to-tr from-brand-500/70 via-secondaryBrand-500/60 to-brand-300/50 opacity-25" style="clip-path: polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)"></div>
        </div>
        <div class="overflow-hidden">
          <div class="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-48 lg:px-8 lg:pt-32">
            <div class="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div class="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">Escalade sportive · Couenne & falaise</p>
                <h1 class="mt-6 text-5xl font-semibold tracking-tight text-pretty text-white sm:text-7xl">
                  Viens progresser et libérer ta grimpe en falaise
                </h1>
                <p class="mt-8 text-lg font-medium text-pretty text-gray-300 sm:max-w-md sm:text-xl/8 lg:max-w-none">
                  Je t'emmène sur les spots les plus beaux et adaptés pour progresser dans ton escalade en couenne, maîtriser les manips modernes et gagner en confiance.
                </p>
                <div class="mt-8 space-y-4 text-base text-gray-300">
                  <div v-for="highlight in heroHighlights" :key="highlight" class="flex items-start gap-3">
                    <svg class="size-5 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12l6 6 9-13.5" />
                    </svg>
                    <span>{{ highlight }}</span>
                  </div>
                </div>
                <div class="mt-10 flex flex-wrap items-center gap-4">
                  <a href="#stages" class="rounded-md bg-secondaryBrand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 hover:bg-secondaryBrand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400">
                    Découvrir les stages falaise
                  </a>
                  <a href="#valeurs" class="text-sm font-semibold text-secondaryBrand-100 hover:text-white">
                    En savoir plus <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div class="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div
                  v-for="column in heroColumns"
                  :key="column.id"
                  :class="column.wrapper"
                >
                  <div v-for="shot in column.items" :key="shot.alt" class="relative">
                    <img :src="shot.src" :alt="shot.alt" class="aspect-[2/3] w-full rounded-xl bg-white/5 object-cover shadow-lg" />
                    <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10 ring-inset"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Intro -->
      <section id="valeurs" class="bg-white py-24 text-gray-900 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-3xl text-center">
            <p class="text-base font-semibold text-brand-600">Esprit falaise</p>
            <h2 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Qu'est-ce que l'escalade sportive en couenne ?</h2>
            <p class="mt-6 text-lg text-gray-600">On grimpe sur une seule longueur avec des points équipés pour se concentrer sur la gestuelle, la fluidité et les sensations. C'est l'espace idéal pour progresser, apprendre à se sécuriser et prendre confiance avant de partir vers des parois plus longues.</p>
          </div>
          <div class="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div class="rounded-3xl border border-gray-100 bg-gray-50/70 p-8 shadow-sm">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Phase 1</p>
              <h3 class="mt-4 text-2xl font-semibold text-gray-900">Découverte guidée</h3>
              <p class="mt-4 text-base text-gray-600">Lecture de la falaise, repérage des lignes, installation au pied de voie et rappel des consignes essentielles.</p>
            </div>
            <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg shadow-brand-100/50">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Phase 2</p>
              <h3 class="mt-4 text-2xl font-semibold text-gray-900">Pratique intense</h3>
              <p class="mt-4 text-base text-gray-600">Ateliers d'assurage dynamique, pose des dégaines, travail des sections clés et coaching personnalisé à chaque essai.</p>
            </div>
            <div class="rounded-3xl border border-gray-100 bg-gray-50/70 p-8 shadow-sm">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Phase 3</p>
              <h3 class="mt-4 text-2xl font-semibold text-gray-900">Autonomie et progression</h3>
              <p class="mt-4 text-base text-gray-600">Bilan individuel, plan de progression et outils pour continuer à grimper sereinement en extérieur.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Value propositions -->
      <section class="bg-gray-50 py-24 text-gray-900 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="max-w-2xl">
            <p class="text-base font-semibold text-brand-600">Proposition d'une sortie</p>
            <h2 class="mt-4 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">Je m’occupe de ta sécurité, de ta progression et du choix des spots</h2>
            <p class="mt-6 text-lg text-gray-600">Tout est pensé pour que tu te concentres sur grimper : j’assure ta sécurité, je guide ta progression et je t’emmène sur des falaises de couenne adaptées à ton niveau, pour profiter sans stress.</p>
          </div>
          <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            <article v-for="value in valueProps" :key="value.title" class="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5">
              <div class="inline-flex size-12 items-center justify-center rounded-full bg-secondaryBrand-100 text-secondaryBrand-700">
                <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12l6 6 9-13.5" />
                </svg>
              </div>
              <h3 class="mt-6 text-xl font-semibold text-gray-900">{{ value.title }}</h3>
              <p class="mt-4 text-base text-gray-600">{{ value.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Why choose me -->
      <section class="bg-white py-24 text-gray-900 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="lg:grid lg:grid-cols-12 lg:gap-16">
            <div class="lg:col-span-5">
              <p class="text-base font-semibold text-brand-600">De la grimpe oui ! Mais...</p>
              <h2 class="mt-4 text-4xl font-semibold tracking-tight">Avant tout de l'humain et un accompagnement personnalisé</h2>
              <p class="mt-6 text-lg text-gray-600">Chaque stage est limité en nombre de participant·es pour favoriser l'échange, s'adapter au niveau de chacun·e et créer des moments qui restent. J'amène le matériel commun, les idées de voies et surtout l'envie de partager.</p>
            </div>
            <div class="mt-12 lg:col-span-7 lg:mt-0">
              <dl class="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div v-for="benefit in benefits" :key="benefit.title" class="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <dt class="text-base font-semibold text-gray-900">{{ benefit.title }}</dt>
                  <dd class="mt-3 text-sm text-gray-600">{{ benefit.description }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <!-- Stage listing -->
      <section id="stages" class="bg-brand-950 py-24 text-white sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold text-secondaryBrand-200">Stages falaise</p>
            <h2 class="mt-4 text-4xl font-semibold tracking-tight">Choisis le stage qui te correspond</h2>
            <p class="mt-4 text-lg text-gray-300">Des spots iconiques, des petits groupes et un programme adapté à ton niveau pour progresser en extérieur.</p>
          </div>
          <div class="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <NuxtLink
              v-for="stage in falaiseStages"
              :key="stage.id"
              :to="`/escalade/${stage.slug}`"
              class="group flex flex-col overflow-hidden rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <div class="relative mb-6 h-48 overflow-hidden rounded-2xl">
                <img :src="stage.imageUrl" :alt="stage.title" class="size-full object-cover transition duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span
                    v-for="category in stage.category"
                    :key="`${stage.id}-${category.title}`"
                    class="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-900"
                  >
                    {{ category.title }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-secondaryBrand-200">{{ stage.date }}</p>
              <h3 class="mt-2 text-2xl font-semibold">{{ stage.title }}</h3>
              <p class="mt-3 flex items-center gap-2 text-sm text-gray-300">
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-11.25a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8.25a6.75 6.75 0 00-5.954-3.375h-.792A6.75 6.75 0 0112 18z" />
                </svg>
                {{ stage.location }}
              </p>
              <p class="mt-4 text-sm text-gray-300">{{ stage.description }}</p>
              <div class="mt-6 flex items-center gap-4 text-xs text-gray-300">
                <span v-if="stage.informations">{{ stage.informations[0].value }} jours</span>
                <span v-if="stage.informations" class="flex items-center gap-1">
                  <svg class="size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  {{ stage.informations[1].value }} places max
                </span>
              </div>
              <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondaryBrand-200">
                Voir ce stage
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- CTA finale -->
      <section class="bg-white py-24 text-gray-900 sm:py-32">
        <div class="mx-auto max-w-4xl rounded-3xl bg-brand-950 px-8 py-16 text-center text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">Une envie particulière ? Un projet ?</p>
          <h2 class="mt-6 text-4xl font-semibold tracking-tight">On prépare ta prochaine sortie falaise</h2>
          <p class="mt-4 text-lg text-brand-100">Dis-moi où tu veux grimper et ce que tu souhaites travailler pour progresser</p>
          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:contact@bdk.fr" class="rounded-md border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10">Me contacter</a>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
const { getStagesByType } = useStages()

const falaiseStages = computed(() => getStagesByType('falaise'))

const heroHighlights = [
  'Grimpe et assurage en toute sécurité',
  'Progression et perfectionnement à ton rythme',
  'Mise en confiance en-tête ou en moulinette',
]

const heroColumns = [
  {
    id: 'column-a',
    wrapper: 'ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-0 xl:pt-80',
    items: [
      { src: '/images/Garins.jpg', alt: 'Escalade sportive falaise couenne aux Garins Bauges Châtelard' },
      { src: '/images/falaise-Ceuse.jpg', alt: 'Escalade sportive falaise couenne à Ceüse' },
    ],
  },
  {
    id: 'column-b',
    wrapper: 'mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36',
    items: [
      { src: '/images/falaise-escalade-beaufortain.jpg', alt: 'Grimpe escalade sportive dans le Beaufortain' },
      { src: '/images/Esacalade-Cessens-13.jpg', alt: 'Escalade sportive couenne à la falaise de Cessens en Savoie' },
    ],
  },
  {
    id: 'column-c',
    wrapper: 'w-44 flex-none space-y-8 pt-32 sm:pt-0',
    items: [
      { src: '/images/escalade-couenne-falaise-beaufortain.jpg', alt: 'Escalade sportive falaise couenne à Beaufortain en Savoie' },
      { src: '/images/escalade-falaise-Sardaigne.jpg', alt: 'Escalade en Sardaigne' },
    ],
  },
]

const valueProps = [
  {
    title: 'Grimpe et assurage en toute sécurité',
    description: 'Briefing complet, rappels des manips essentielles, vérifications croisées et encadrement permanent pour grimper sereinement sur chaque voie de couenne.'
  },
  {
    title: 'Progression et perfectionnement',
    description: 'Travail des placements, respiration, lecture de voie et gestion de l’effort avec des conseils personnalisés et des objectifs adaptés à ton niveau.'
  },
  {
    title: 'Découverte de spots adaptés',
    description: 'Choix de super falaises et de secteurs variés, avec des voies en adéquation avec ton niveau et tes envies, pour découvrir des lieux motivants, beaux et sécurisants.'
  },
  {
    title: 'Mise en confiance',
    description: 'On crée ensemble un cadre bienveillant pour dépasser la peur de la chute, apprendre à engager progressivement et cultiver le plaisir du geste juste.'
  }
]

const benefits = [
  {
    title: 'Ateliers techniques ciblés',
    description: 'Assurage dynamique, remontées sur corde, gestion des dégaines... On aborde les manipulations avec pédagogie.'
  },
  {
    title: 'Encadrement diplômé d’État',
    description: 'Tu profites de l’expérience d’un guide passionné avec une solide connaissance des sites naturels.'
  },
  {
    title: 'Ambiance conviviale',
    description: 'Groupes restreints pour partager les essais, les réussites et les rigolades au pied de falaise.'
  },
  {
    title: 'Sites variés et inspirants',
    description: 'Je choisis des falaises adaptées aux conditions et aux objectifs du groupe pour garantir plaisir et progression.'
  }
]

useHead({
  title: 'Escalade sportive en couenne & falaise - Brigade du skif',
  meta: [
    {
      name: 'description',
      content: 'Comprends ce qu’est l’escalade sportive en couenne, découvre ma proposition de valeur et trouve ton prochain stage falaise.'
    }
  ]
})
</script>
