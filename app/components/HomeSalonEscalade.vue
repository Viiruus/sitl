<script setup lang="ts">
import { ArrowDownIcon, ArrowUpRightIcon } from '@heroicons/vue/24/outline'
import { SALON_ESCALADE_2027, type SalonOfferPhase } from '~~/shared/utils/salon-escalade-offer'

defineProps<{ phase: SalonOfferPhase }>()
</script>

<template>
  <section v-if="phase !== 'ended'" id="salon-escalade" aria-labelledby="salon-title" class="salon-section scroll-mt-24 bg-[#f5f3ed] px-5 py-16 sm:px-8 sm:py-24">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-950">
        <p class="flex items-center gap-2"><span class="size-2 rounded-full bg-blue-600" />Le rendez-vous de janvier</p>
        <p>15, 16 &amp; 17 janvier 2027 · Paris</p>
      </div>

      <div class="salon-card overflow-hidden rounded-[2rem] bg-[#06152f] text-white">
        <div class="salon-poster hidden items-center justify-center bg-[#02030c] lg:flex">
          <img
            src="/images/salon-escalade-2027/affiche-800.webp"
            srcset="/images/salon-escalade-2027/affiche-480.webp 480w, /images/salon-escalade-2027/affiche-800.webp 800w"
            sizes="(min-width: 1280px) 484px, 38vw"
            width="800"
            height="1131"
            alt="Affiche officielle du Salon de l’Escalade 2027, 7e édition, du 15 au 17 janvier à Paris Expo Porte de Versailles."
            class="block h-auto w-full max-w-[280px] md:max-w-none"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div class="salon-content flex flex-col justify-center px-6 py-8 sm:p-10 lg:p-12">
          <img src="/images/salon-escalade-2027/logo-edition7.webp" width="440" height="263" alt="Salon de l’Escalade, édition 7" class="mb-6 h-auto w-44 lg:hidden" loading="lazy" decoding="async" />
          <p class="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-200">
            <span class="size-1.5 rounded-full bg-amber-300" />La Brigade du kiff y sera
          </p>
          <h2 id="salon-title" class="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            On se retrouve<br />au Salon ?
          </h2>
          <p class="mt-5 max-w-lg text-base leading-relaxed text-blue-100/80">
            Venez rencontrer la Brigade du kiff au Salon de l’Escalade, à Paris Expo Porte de Versailles.
            Parlons grimpe et prochaines aventures !
          </p>

          <div class="salon-ticket relative mt-8 rounded-2xl bg-amber-300 p-5 text-brand-950 sm:p-6">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em]">L’offre spéciale Salon</p>
            <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
              <p class="salon-discount whitespace-nowrap font-semibold leading-none tracking-[-0.08em]">−{{ SALON_ESCALADE_2027.discountPercent }}<span class="ml-1 text-[0.5em] tracking-tight">%</span></p>
              <p class="text-lg font-semibold leading-snug">sur votre prochain<br />stage d’escalade</p>
            </div>
            <p class="mt-4 border-t border-brand-950/20 pt-4 text-sm leading-relaxed">
              Inscrivez-vous à un stage <strong>du 15 au 17 janvier 2027</strong> pour bénéficier de la remise.
              Les dates du stage restent au choix.
            </p>
          </div>

          <div class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <NuxtLink to="/stages-escalade" class="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
              {{ phase === 'active' ? 'Choisir mon stage à −20 %' : 'Repérer mon prochain stage' }}
              <ArrowUpRightIcon class="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </NuxtLink>
            <a href="https://www.salon-escalade.com/visiter/billetterie/" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-11 items-center gap-2 text-sm text-blue-100 underline decoration-white/30 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
              Infos &amp; billets du Salon<span class="sr-only"> (nouvel onglet)</span>
              <ArrowUpRightIcon class="size-4" aria-hidden="true" />
            </a>
          </div>
          <p class="mt-5 text-xs leading-relaxed text-blue-200/70">Aucun code à saisir : la remise sera prise en compte par votre moniteur pour toute inscription effectuée pendant ces trois jours.</p>
        </div>
      </div>
      <a href="#stages" class="mx-auto mt-7 flex w-fit min-h-11 items-center gap-2 text-sm font-medium text-brand-950 underline decoration-brand-950/30 underline-offset-4 hover:decoration-brand-950">
        Les prochains départs<ArrowDownIcon class="size-4" aria-hidden="true" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.salon-card { display: grid; }
.salon-discount { font-size: clamp(4.5rem, 7vw, 6.5rem); }
.salon-ticket::before, .salon-ticket::after {
  content: '';
  position: absolute;
  top: 40%;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #06152f;
}
.salon-ticket::before { left: -0.5rem; }
.salon-ticket::after { right: -0.5rem; }
@media (min-width: 1024px) {
  .salon-card { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.4fr); }
}
@media (prefers-reduced-motion: reduce) {
  .salon-section :deep(*) { transition: none; }
}
</style>
