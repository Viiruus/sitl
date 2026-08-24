<script setup lang="ts">
import { resolvePublicSiteUrl } from '~~/shared/utils/site-url'

const partners = [
  {
    name: '4c+',
    websiteUrl: 'https://4c-plus.com/',
    logoUrl: 'https://cdn.shopify.com/s/files/1/0931/0650/3944/files/LOGO_con_web.jpg?v=1787406790',
    logoAlt: '4c+ - Matériel d’escalade et d’alpinisme',
    description: [
      '4c+, c’est votre spécialiste du matériel d’escalade et d’alpinisme. Vous y trouverez tout l’équipement nécessaire pour vos aventures, avec une sélection d’articles uniques et des prix imbattables.',
      'Et ce n’est pas tout : 4c+ propose également un service complet de ressemelage de chaussons ainsi que des réparations techniques pour donner une seconde vie à votre matériel.',
    ],
  },
]

const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() => {
  try {
    return new URL('/partenaires', resolvePublicSiteUrl(runtimeConfig.public.publicUrl)).toString()
  } catch {
    return '/partenaires'
  }
})

useHead(() => ({
  titleTemplate: '%s',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  title: 'Nos partenaires | Brigade du kiff',
  description: 'Découvre les partenaires qui accompagnent la Brigade du kiff et soutiennent nos aventures verticales.',
  robots: 'index, follow, max-image-preview:large',
})
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f5] text-[#242424]">
    <div class="bg-brand-950 text-white">
      <AppHeader />
      <div class="w-full px-4 pb-20 pt-40 sm:px-6 lg:px-8 lg:pb-24">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-secondaryBrand-200">
          Ils font partie de l’aventure
        </p>
        <h1 class="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-pretty sm:text-7xl">
          Nos partenaires
        </h1>
        <p class="mt-6 max-w-2xl text-lg/8 text-brand-100/80">
          Des acteurs passionnés qui partagent notre goût du terrain, du matériel durable et des aventures en pleine nature.
        </p>
      </div>
    </div>

    <main class="w-full px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <ul role="list" class="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="partner in partners" :key="partner.name">
          <article class="group max-w-[340px] overflow-hidden rounded-[14px] border border-[#e6e6e6] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
            <a
              :href="partner.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="block border-b border-[#f0f0f0] bg-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondaryBrand-500"
            >
              <img
                :src="partner.logoUrl"
                :alt="partner.logoAlt"
                width="340"
                height="180"
                class="h-[180px] w-full bg-white object-contain p-3"
                loading="lazy"
                decoding="async"
              >
            </a>

            <div class="px-5 pb-[22px] pt-[18px]">
              <h2 class="mb-1 text-xs font-bold uppercase tracking-[0.06em] text-[#e8622c]">
                {{ partner.name }}
              </h2>
              <div class="mb-[18px] space-y-4 text-sm/6 text-[#4a4a4a]">
                <p v-for="paragraph in partner.description" :key="paragraph">
                  {{ paragraph }}
                </p>
              </div>
              <a
                :href="partner.websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg bg-secondaryBrand-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-secondaryBrand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondaryBrand-500"
              >
                Visiter le site
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </li>
      </ul>
    </main>

    <AppFooter />
  </div>
</template>
