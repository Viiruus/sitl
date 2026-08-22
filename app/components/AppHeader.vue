<template>
  <header
    class="inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300"
    :class="isScrolled
      ? 'fixed bg-white shadow-lg shadow-brand-950/10 ring-1 ring-black/5'
      : 'absolute bg-transparent'"
  >
    <div class="mx-auto max-w-7xl">
      <div
        class="px-6 transition-[padding] duration-300 lg:px-8"
        :class="isScrolled ? 'py-3' : 'pt-10 pb-3'"
      >
        <nav class="flex items-center justify-between lg:justify-start" aria-label="Global">
          <NuxtLink to="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Brigade du Kiff</span>
            <img alt="Brigade du Kiff" class="h-10 w-auto" src="~/assets/images/brigade-du-kiff_amber-logo.png" />
          </NuxtLink>
          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 transition-colors lg:hidden"
            :class="isScrolled ? 'text-brand-950' : 'text-gray-200'"
            @click="mobileMenuOpen = true"
          >
            <span class="sr-only">Open main menu</span>
            <Bars3Icon class="size-6" aria-hidden="true" />
          </button>
          <div class="hidden lg:ml-10 lg:flex lg:gap-x-8 xl:gap-x-12">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="text-sm/6 font-semibold transition-colors"
              :class="isScrolled ? 'text-brand-950 hover:text-secondaryBrand-600' : 'text-white hover:text-secondaryBrand-200'"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
          <div class="hidden lg:flex lg:flex-1 lg:justify-end">
            <button
              v-if="showCommunityCta"
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400"
              @click="openModal"
            >
              Rejoindre la communauté <span aria-hidden="true">→</span>
            </button>
            <NuxtLink
              v-else
              :to="accountPath"
              class="inline-flex items-center gap-2 rounded-full bg-secondaryBrand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400"
            >
              Mon compte
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
            <span class="sr-only">Brigade du Kiff</span>
            <img class="h-8 w-auto" src="~/assets/images/brigade-du-kiff_amber-logo.png" alt="Brigade du Kiff" />
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
              <button
                v-if="showCommunityCta"
                type="button"
                class="-mx-3 block w-full rounded-lg px-3 py-2.5 text-left text-base/7 font-semibold text-white hover:bg-white/5"
                @click="() => { mobileMenuOpen = false; openModal() }"
              >
                Rejoindre la communauté <span aria-hidden="true">→</span>
              </button>
              <NuxtLink
                v-else
                :to="accountPath"
                class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                @click="mobileMenuOpen = false"
              >
                Mon compte
              </NuxtLink>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
    <AuthModal />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { Dialog, DialogPanel } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import AuthModal from './AuthModal.vue'

const navigation = [
  { name: 'Les stages', href: '/stages-escalade' },
  { name: 'La Brigade', href: '/la-brigade' },
  { name: 'Carnet vertical', href: '/articles' },
  { name: 'Partenaires', href: '/partenaires' },
]

const { loggedIn, user } = useUserSession()
const { openModal } = useAuthModal()

const showCommunityCta = computed(() => !loggedIn.value)
const accountPath = computed(() => user.value?.role === 'GUIDE' ? '/moniteurs' : '/profil')

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const updateHeaderFromScroll = () => {
  isScrolled.value = window.scrollY > 24
}

onMounted(() => {
  updateHeaderFromScroll()
  window.addEventListener('scroll', updateHeaderFromScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateHeaderFromScroll)
})
</script>
