<template>
  <div class="bg-brand-950">
    <!-- Header réutilisable -->
    <AppHeader />

    <!-- Hero + encarts concept -->
    <div class="relative">
      <div class="mx-auto max-w-7xl">
        <div class="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
          <svg
            class="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-brand-950 lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="0,0 90,0 50,100 0,100" />
          </svg>

          <!-- HERO -->
          <div class="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-40 lg:pr-0 2xl:py-56">
            <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <div class="hidden sm:mb-10 sm:flex">
                <div
                  class="relative rounded-full px-3 py-1 text-sm/6 text-brand-200/80 ring-1 ring-white/10 hover:ring-white/20"
                >
                  Viens découvrir les prochaines aventures d'escalade prévues
                  <a href="#aventures" class="font-semibold whitespace-nowrap text-secondaryBrand-400">
                    <span class="absolute inset-0" aria-hidden="true" />
                    C'est par ici <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <h1 class="text-5xl font-semibold tracking-tight text-pretty text-white sm:text-7xl">
                Grimpe et aventures sans limites
              </h1>
              <p class="mt-8 text-lg font-medium text-pretty text-brand-200/80 sm:text-xl/8">
                Des moniteurs du coin imaginent des aventures d’escalade à leur image :
                falaises de chez eux, petits hébergements sympas, bons produits locaux…
                Tu viens pour grimper, progresser, te faire plaisir. On s’occupe du reste en coulisses.
              </p>
              <div class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#aventures"
                  class="rounded-md bg-secondaryBrand-500 px-3.5 py-2.5 text-sm font-semibold text-brand-950 shadow-xs hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  Découvrir les prochaines aventures
                </a>

                <NuxtLink
                  to="/login?source=home"
                  class="text-sm/6 font-semibold text-white"
                >
                  Créer mon compte grimpeur <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image hero -->
      <div class="bg-brand-950 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          class="aspect-3/2 object-cover lg:aspect-auto lg:size-full"
          src="~/assets/images/escalade0.jpg"
          alt=""
        />
      </div>
    </div>

    <!-- Encarts concept (toujours sur fond dark) -->
    <section class="border-t border-brand-900/60 bg-brand-950">
      <div class="mx-auto max-w-7xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-12 lg:px-8">
        <div class="grid gap-4 text-sm md:grid-cols-3">
          <div class="rounded-2xl border border-brand-800 bg-brand-900/80 p-4 space-y-1.5">
            <h2 class="text-xs font-semibold text-secondaryBrand-300 uppercase tracking-[0.2em]">
              Des aventures locales
            </h2>
            <p class="text-brand-100/80">
              Chaque aventure est imaginée par un moniteur du coin, loin des packages anonymes.
              Tu grimpes sur leurs falaises, dans leurs massifs, avec leurs habitudes.
            </p>
          </div>
          <div class="rounded-2xl border border-brand-800 bg-brand-900/80 p-4 space-y-1.5">
            <h2 class="text-xs font-semibold text-secondaryBrand-300 uppercase tracking-[0.2em]">
              Grimpe & terroir
            </h2>
            <p class="text-brand-100/80">
              Refuges, gîtes, fermes, producteurs… la Brigade du kif partage ses vrais bons plans
              pour vivre l’expérience complète au-delà de la falaise.
            </p>
          </div>
          <div class="rounded-2xl border border-brand-800 bg-brand-900/80 p-4 space-y-1.5">
            <h2 class="text-xs font-semibold text-secondaryBrand-300 uppercase tracking-[0.2em]">
              Ton format
            </h2>
            <p class="text-brand-100/80">
              Aventures « grimpe seulement » (tu gères ton hébergement) ou « immersion complète »
              (hébergement + repas + encadrement). À toi de choisir ce qui matche ton kif.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Section Aventures (ex "Stages") sur fond clair -->
  <div id="aventures" class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <h2 class="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
        Les prochaines aventures d'escalade
      </h2>
      <p class="mt-2 text-lg/8 text-gray-600">
        Embarque pour notre prochaine aventure imaginée par la Brigade du kif.
      </p>
      <div class="mt-16 space-y-20 lg:mt-20">
        <article
          v-for="stage in stagesAffiches"
          :key="stage.id"
          class="relative isolate flex flex-col gap-8 lg:flex-row"
        >
          <div class="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
            <img
              :src="stage.imageUrlTiny"
              alt=""
              class="absolute inset-0 size-full rounded-2xl bg-gray-50 object-cover"
            />
            <div class="absolute inset-0 rounded-2xl inset-ring inset-ring-gray-900/10" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <time :datetime="stage.datetime" class="text-gray-500">
                {{ stage.date }}
              </time>
              <a
                v-for="category in stage.category"
                :key="category.title"
                :href="category.href"
                class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
              >
                {{ category.title }}
              </a>
            </div>
            <div class="group relative max-w-xl">
              <h3 class="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                <NuxtLink :to="`/escalade/${stage.slug}`">
                  <span class="absolute inset-0" />
                  {{ stage.title }}
                </NuxtLink>
              </h3>
              <p class="mt-2 flex items-center gap-x-2 text-sm text-gray-600">
                <svg
                  class="size-4 text-brand-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z"
                  />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
                {{ stage.location }}
              </p>
              <p class="mt-5 text-sm/6 text-gray-600">
                {{ stage.description }}
              </p>
            </div>
            <div class="mt-6 flex border-t border-gray-900/5 pt-6">
              <div class="relative flex items-center gap-x-4">
                <dl class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div
                    v-for="info in stage.informations"
                    :key="info.name"
                    class="flex flex-col-reverse gap-1"
                  >
                    <dt class="text-base/7 text-gray-700">
                      {{ info.name }}
                    </dt>
                    <dd class="text-4xl font-semibold tracking-tight text-gray-900">
                      {{ info.value }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>

  <!-- Section Communauté + FAQ sur fond dark -->
  <div class="bg-brand-900" id="concept">
    <div class="mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8 lg:py-40">
      <!-- Bloc communauté -->
      <section class="mb-16 space-y-3 max-w-3xl">
        <h2 class="text-3xl font-semibold tracking-tight text-pretty text-secondaryBrand-300 sm:text-4xl">
          Rejoindre la communauté des grimpeurs
        </h2>
        <p class="text-base/7 text-pretty text-brand-200/80">
          Crée ton compte grimpeur, réponds à quelques questions sur ta pratique puis
          retrouve les prochaines aventures, des infos pratiques et les annonces des moniteurs
          directement depuis ton espace personnel.
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink
            to="/login?source=homepage"
            class="px-4 py-2 rounded-lg bg-secondaryBrand-500 text-brand-950 text-sm font-medium hover:bg-secondaryBrand-400 transition"
          >
            Créer mon compte & accéder à mon espace
          </NuxtLink>
          <p class="text-xs text-brand-200/70">
            Tu pourras compléter ton profil et recevoir les infos adaptées après connexion.
          </p>
        </div>
      </section>

      <!-- FAQ / explications -->
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-5">
          <h2 class="text-3xl font-semibold tracking-tight text-pretty text-secondaryBrand-300 sm:text-4xl">
            Les questions que tu pourrais te poser
          </h2>
          <p class="mt-4 text-base/7 text-pretty text-brand-200/80">
            D'autres questions ?
            <a
              href="#"
              class="font-semibold text-secondaryBrand-400 hover:text-secondaryBrand-300"
            >
              Contacte moi
            </a>.
          </p>
        </div>
        <div class="mt-10 lg:col-span-7 lg:mt-0">
          <dl class="space-y-10">
            <div v-for="faq in faqs" :key="faq.question">
              <dt class="text-base/7 font-semibold text-white">
                {{ faq.question }}
              </dt>
              <dd class="mt-2 text-base/7 text-brand-200/80 whitespace-pre-line">
                {{ faq.answer }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer réutilisable -->
  <AppFooter />
</template>

<script setup>
const { stages } = useStages()
// Filtrer uniquement les stages à afficher sur l'accueil
const stagesAffiches = stages.slice(0, 3)

const faqs = [
  {
    question: "La différence entre l'escalade en couenne et l'escalade en grande voie ?",
    answer:
      "L'escalade en couenne, appelée escalade sportive, consiste à grimper une voie d'une seule longueur, sur une falaise ou sur une paroi artificielle (salle d'escalade) complètement équipée avec des ancrages permanents, permettant au grimpeur de s'assurer à l'aide de dégaines. Il existe des voies de tous niveaux, facile à extrêmement difficile. Idéale pour l'initiation et pour progresser.\n\nL'escalade en grande voie consiste à grimper une voie de plusieurs longueurs, sur des grandes falaises plus ou moins équipées avec des points bétons. L'objectif est d'escalader en cordée jusqu'au sommet de la falaise. Cette pratique nécessite de connaître des manipulations et techniques particulières. Il existe des grandes voies de tous niveaux, pouvant durer de la demi-journée à plusieurs jours.",
  },
  {
    question: "La différence entre l'escalade en tête et l'escalade en moulinette ?",
    answer:
      "L'escalade en tête consiste à grimper en contribuant à son propre assurage. En plus d'être assurer par son assureur, le grimpeur en tête doit progressivement installer les dégaines et passer sa corde dans les dégaines afin d'assurer sa sécurité en cas de chute. Il n'y a pas de corde pré-installée. Il est donc important pour le grimpeur en tête de choisir une voie adaptée à son niveau et ne pas surestimer son niveau, car il devra arriver jusqu'au relais.\n\nL'escalade en moulinette consiste à grimper sur une corde déjà installée sur la falaise. Il est donc possible, en cas de difficulté, de redescendre à tout moment.",
  },
]
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>
