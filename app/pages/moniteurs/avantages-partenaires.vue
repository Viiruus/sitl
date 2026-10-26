<script setup lang="ts">
definePageMeta({
  middleware: 'guide-auth',
})

useSeoMeta({
  title: 'Avantages partenaires | Espace moniteur',
  description: 'Retrouve les offres partenaires et les codes promo de la Brigade du Kiff.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const router = useRouter()
const { clear, fetch } = useUserSession()
const { data: guideData } = await useFetch('/api/guides/me')
const guide = computed(() => guideData.value?.guide ?? null)
const { data, pending, error, refresh } = await useFetch('/api/guides/partner-benefits', {
  key: 'guide-partner-benefits',
})

const copiedOffer = ref<string | null>(null)
const copying = ref(false)
const copyMessage = ref('')
const percentFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const priceFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

const copyCode = async (id: string, code: string) => {
  copying.value = true
  copiedOffer.value = null
  copyMessage.value = ''

  try {
    await navigator.clipboard.writeText(code)
    copiedOffer.value = id
    copyMessage.value = `Le code ${code} a été copié.`
  } catch {
    copyMessage.value = 'La copie automatique est indisponible. Sélectionne le code pour le copier manuellement.'
  } finally {
    copying.value = false
  }
}

const logout = async () => {
  await clear()
  clearNuxtData('guide-partner-benefits')
  await fetch()
  await router.push('/moniteurs/login')
}
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:gap-12">
      <MoniteursGuideSidebar :guide="guide" :current-path="route.path" @logout="logout" />

      <main class="min-w-0 flex-1 space-y-8">
        <header>
          <p class="text-sm uppercase tracking-[0.3em] text-secondaryBrand-300">Les bons plans de la Brigade</p>
          <h1 class="mt-4 text-3xl font-semibold sm:text-4xl">Avantages partenaires</h1>
          <p class="mt-4 max-w-2xl leading-7 text-brand-100/80">
            Des offres pour t’équiper, renouveler ton parc matériel et faire profiter tes clients de nos partenariats.
          </p>
        </header>

        <p v-if="pending" role="status" class="text-brand-100/80">Chargement des offres…</p>
        <div v-else-if="error" role="alert" class="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          <p>Impossible de charger les offres partenaires.</p>
          <button type="button" class="mt-4 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300" @click="refresh()">
            Réessayer
          </button>
        </div>
        <p v-else-if="!data?.partners.length" class="rounded-2xl bg-white/5 p-6 text-brand-100/80">
          Les offres partenaires ne sont pas disponibles pour le moment.
        </p>

        <template v-else>
          <section v-for="partner in data.partners" :key="partner.name" class="space-y-6" :aria-label="`Offres ${partner.name}`">
            <div class="flex flex-col gap-5 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div class="flex items-center gap-5">
                <div aria-hidden="true" class="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-secondaryBrand-300 text-3xl font-bold tracking-tight text-brand-950">{{ partner.name }}</div>
                <div>
                  <p class="text-xs uppercase tracking-[0.25em] text-secondaryBrand-200">Partenaire</p>
                  <h2 class="mt-1 text-2xl font-semibold">{{ partner.name }}</h2>
                  <p class="mt-1 text-sm text-brand-100/70">Matériel d’escalade et d’alpinisme</p>
                </div>
              </div>
              <a :href="partner.websiteUrl" target="_blank" rel="noopener noreferrer" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">
                Voir la boutique <span aria-hidden="true">↗</span>
                <span class="sr-only">{{ partner.name }} (nouvel onglet)</span>
              </a>
            </div>

            <p class="text-sm leading-6 text-brand-100/70">Copie le code correspondant à ton achat, puis saisis-le dans le panier sur le site de {{ partner.name }}.</p>

            <p role="status" aria-live="polite" aria-atomic="true" class="text-sm text-secondaryBrand-200">{{ copyMessage }}</p>

            <article v-for="offer in partner.offers" :key="offer.id" :aria-labelledby="`${offer.id}-title`" class="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
              <div class="p-6 sm:p-8">
                <h3 :id="`${offer.id}-title`" class="text-xl font-semibold">{{ offer.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-brand-100/70">{{ offer.description }}</p>

                <div class="mt-5 flex flex-col gap-4 rounded-2xl border border-secondaryBrand-300/25 bg-secondaryBrand-300/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div class="min-w-0">
                    <p class="text-xs uppercase tracking-[0.2em] text-secondaryBrand-200/80">Code promo</p>
                    <code class="mt-2 block select-all break-all text-lg font-semibold tracking-wide text-secondaryBrand-200">{{ offer.code }}</code>
                  </div>
                  <button type="button" :disabled="copying" :aria-label="`Copier le code ${offer.code} — ${offer.title}`" class="inline-flex shrink-0 items-center justify-center rounded-xl bg-secondaryBrand-300 px-4 py-2.5 text-sm font-semibold text-brand-950 transition hover:bg-secondaryBrand-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300 disabled:cursor-wait disabled:opacity-60" @click="copyCode(offer.id, offer.code)">
                    {{ copiedOffer === offer.id ? 'Code copié !' : 'Copier le code' }}
                  </button>
                </div>

                <ul role="list" class="mt-6 divide-y divide-white/10">
                  <li v-for="discount in offer.discounts" :key="discount.products" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p class="text-sm font-medium leading-6 text-white">{{ discount.products }}</p>
                      <p v-if="discount.priceBefore !== undefined && discount.priceAfter !== undefined" class="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                        <span class="text-brand-100/60"><span class="sr-only">Prix avant remise : </span><s>{{ priceFormatter.format(discount.priceBefore) }}</s></span>
                        <span class="font-semibold text-white"><span class="sr-only">Prix après remise : </span>{{ priceFormatter.format(discount.priceAfter) }}</span>
                      </p>
                    </div>
                    <span class="whitespace-nowrap rounded-lg bg-secondaryBrand-300/10 px-3 py-1.5 text-sm font-semibold text-secondaryBrand-200">
                      −{{ percentFormatter.format(discount.percent) }} %
                    </span>
                  </li>
                </ul>
              </div>
            </article>

            <p class="text-sm leading-6 text-brand-100/60">
              Offres et tarifs communiqués par {{ partner.name }}. Des conditions s’appliquent : vérifie les produits éligibles et la remise dans ton panier avant de commander.
            </p>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>
