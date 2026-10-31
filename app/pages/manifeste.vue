<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const stanzas = [
  [
    'Apprécier les couleurs du lever du soleil : rouge, orange, rose, jaune.',
    'Cheminer parmi les fleurs, les odeurs et les couleurs jusqu’au pied de la falaise.',
    'Écouter la symphonie des oiseaux qui nous accueillent pour la journée.',
    'Se réchauffer au soleil pendant les courtes journées d’hiver.',
    'Se rafraîchir à l’ombre et au vent quand les températures s’emballent.',
    'Se faire tout petit quand on croise un habitant des falaises.',
  ],
  [
    'Découvrir mille formations géologiques, leur histoire et leurs préhensions.',
    'Se foutre de la pluie quand les secteurs sont abrités.',
    'Rechaper quand la voie est trempée.',
    'Trembler au dessus du point lorsqu’ils sont espacés.',
    'Éprouver la gravité lorsqu’il nous vient à tomber.',
    'Accepter d’attendre une année pour revenir dans son projet.',
  ],
  [
    'Partager la voiture, la corde, l’expérience, les méthodes, la poutre, le café, le repas.',
    'Choisir la falaise qui convient le mieux aux personnes motivées.',
    'Feuilleter son topo le soir et imaginer les aventures du lendemain.',
    'Se retrouver après avoir grimpé, lessivés et épanouis.',
    'Assister à la parade du soleil qui s’en va pour laisser place à la nuit.',
    'Ne pas se retrouver au milieu d’une grande voie à ce moment là.',
  ],
]

const convictions = [
  'Nous sommes convaincus que les valeurs transmisent par l’escalade en milieux naturels sont essentielles à nos vies, particulièrement par les temps qui courent.',
  'Nous pensons qu’un grimpeur éveillé est le plus grand défenseur de son terrain de jeu et qu’il n’est pas voué à pratiquer en salle par manque de responsabilité.',
  'Nous combattons l’idée que la pratique de l’escalade en salle se suffise à elle même et se déconnecte de son identité originelle.',
  'Ce manifeste est une déclaration d’amour à cette pratique, à la nature et aux grimpeurs du monde entier.',
]

const reasons = [
  'Parce que l’escalade est un prétexte pour partager des aventures humaines.',
  'Parce que l’escalade est un jeu et le rocher son terrain.',
]

const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => {
  try {
    return new URL('/manifeste', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/manifeste'
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  title: 'Manifeste — Grimpez dehors | Brigade du kiff',
  description: 'Une déclaration d’amour à l’escalade en milieux naturels, à la nature et aux grimpeurs du monde entier. Découvre le manifeste de la Brigade du kiff.',
  ogTitle: 'Manifeste — Grimpez dehors | Brigade du kiff',
  ogDescription: 'Parce que l’escalade est un jeu et le rocher son terrain. Grimpons dehors.',
  ogUrl: canonicalUrl,
  robots: 'index, follow, max-image-preview:large',
})
</script>

<template>
  <div class="bg-[#f7f6f2] text-brand-950">
    <AppHeader />

    <main>
      <article aria-labelledby="manifeste-title">
        <header class="relative isolate overflow-hidden bg-brand-950 text-white">
          <picture class="absolute inset-0 -z-20 block size-full">
            <img
              src="/images/approche-Calanques-Grande-Candelle.jpg"
              alt=""
              width="1600"
              height="1200"
              class="size-full object-cover object-[55%_35%]"
              fetchpriority="high"
              decoding="async"
            />
          </picture>
          <div class="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-950/55 to-brand-950/20" />
          <div class="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/70 to-brand-950/15" />

          <div class="mx-auto w-full max-w-7xl px-6 pb-10 pt-32 text-center sm:pb-14 sm:pt-36 lg:px-8 lg:pt-40">
            <p class="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-secondaryBrand-200 sm:text-sm">
              <span class="h-px w-10 shrink-0 bg-secondaryBrand-400" aria-hidden="true" />
              Notre raison d’être
              <span class="h-px w-10 shrink-0 bg-secondaryBrand-400" aria-hidden="true" />
            </p>
            <h1 id="manifeste-title" class="mt-6 text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Grimpez <span class="block">dehors</span>
            </h1>
          </div>
        </header>

        <div class="mx-auto max-w-3xl px-6 py-16 sm:py-24 lg:px-8">
          <div class="space-y-12 sm:space-y-16">
            <div v-for="(stanza, index) in stanzas" :key="index" class="space-y-5 text-lg leading-relaxed text-brand-950/85 sm:space-y-6 sm:text-xl sm:leading-9">
              <p v-for="line in stanza" :key="line">{{ line }}</p>
              <div v-if="index < stanzas.length - 1" class="pt-7 sm:pt-10" aria-hidden="true">
                <span class="block h-px w-12 bg-secondaryBrand-500" />
              </div>
            </div>
          </div>

          <div class="mt-14 border-y border-secondaryBrand-500/40 py-8 sm:mt-20 sm:py-10">
            <p class="whitespace-nowrap text-left text-[clamp(0.5rem,2.3vw,1.125rem)] font-bold leading-relaxed tracking-tight">
              <span aria-hidden="true">⚠️</span>
              VOUS NE VIVREZ PAS CES ÉMOTIONS EN GRIMPANT EN SALLE
              <span aria-hidden="true">⚠️</span>
            </p>
          </div>
          <p class="mt-10 text-xl font-medium leading-8 sm:mt-14 sm:text-2xl sm:leading-10">
            C’est pour ça que nous avons créé <span class="font-semibold">Brigade du kiff.</span>
          </p>
        </div>

        <section class="bg-brand-950 px-6 py-16 text-white sm:py-24 lg:px-8" aria-labelledby="convictions-title">
          <div class="mx-auto max-w-3xl">
            <h2 id="convictions-title" class="border-l-4 border-secondaryBrand-400 pl-5 text-3xl font-semibold leading-tight tracking-tight text-pretty sm:pl-8 sm:text-4xl sm:leading-tight">
              NOUS NE NOUS RÉSOLVONS PAS À CE QUE L’ESCALADE DEVIENNE UN SPORT D’INTÉRIEUR
            </h2>
            <div class="mt-10 space-y-7 text-lg leading-relaxed text-brand-100/85 sm:mt-14 sm:text-xl sm:leading-9">
              <p v-for="paragraph in convictions" :key="paragraph">{{ paragraph }}</p>
            </div>
          </div>
        </section>

        <div class="mx-auto max-w-3xl px-6 py-16 sm:py-24 lg:px-8">
          <div class="space-y-6 text-xl font-medium leading-relaxed sm:text-2xl sm:leading-10">
            <p v-for="reason in reasons" :key="reason">{{ reason }}</p>
          </div>
          <div class="mt-14 border-t border-brand-950/15 pt-10 sm:mt-20 sm:pt-14">
            <p class="text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">
              Grimpons <span class="block text-secondaryBrand-600">dehors.</span>
            </p>
          </div>
        </div>
      </article>
    </main>

    <AppFooter />
  </div>
</template>
