<template>
  <header class="absolute inset-x-0 top-0 z-50">
    <div class="mx-auto max-w-7xl">
      <div :class="isHome ? 'px-6 pt-6 lg:max-w-2xl lg:pr-0 lg:pl-8' : 'px-6 pt-6'">
        <nav class="flex items-center justify-between lg:justify-start" aria-label="Global">
          <NuxtLink to="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Your Company</span>
            <img alt="Your Company" class="h-28 w-auto" src="~/assets/images/brigade_du_kif_logo_amber400.png" />
          </NuxtLink>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-200 lg:hidden" @click="mobileMenuOpen = true">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon class="size-6" aria-hidden="true" />
          </button>
          <div class="hidden lg:ml-10 lg:flex lg:gap-x-16">
            <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href" class="text-sm/6 font-semibold text-white">
              {{ item.name }}
            </NuxtLink>
          </div>
          <div class="hidden lg:flex lg:flex-1 lg:justify-end">
            <NuxtLink
              :to="ctaHref"
              class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400"
            >
              {{ ctaLabel }}
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
    <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
      <div class="fixed inset-0 z-50" />
      <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-brand-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Your Company</span>
            <img class="h-8 w-auto" src="~/assets/images/brigade_du_kif_logo_amber400.png" alt="" />
          </NuxtLink>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-200" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-white/10">
            <div class="space-y-2 py-6">
              <NuxtLink 
                v-for="item in navigation" 
                :key="item.name" 
                :to="item.href" 
                class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                @click="mobileMenuOpen = false"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
            <div class="py-6">
              <NuxtLink
                :to="ctaHref"
                class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                @click="mobileMenuOpen = false"
              >
                {{ ctaLabel }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
const route = useRoute()
import { Dialog, DialogPanel } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const navigation = [
  { name: 'Les stages', href: '/aventures-escalade' },
  { name: 'La brigade', href: '/la-brigade' },
]

const { loggedIn, user } = useUserSession()

const ctaLabel = computed(() => {
  if (!loggedIn.value) {
    return 'Connexion'
  }
  return 'Mon compte'
})

const ctaHref = computed(() => (loggedIn.value ? '/profil' : '/login'))

const isHome = computed(() => route.path === '/')

const mobileMenuOpen = ref(false)
</script>
