<template>
  <header
    class="inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300"
    :class="isScrolled
      ? 'fixed bg-brand-950 shadow-lg shadow-black/20'
      : 'absolute bg-transparent'"
  >
    <div class="mx-auto w-full max-w-[90rem]">
      <div
        class="px-4 transition-[padding] duration-300 sm:px-6 lg:px-8"
        :class="isScrolled || props.compact ? 'py-6' : 'py-8'"
      >
        <nav class="flex items-center justify-between lg:justify-start" aria-label="Global">
          <NuxtLink to="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Brigade du kiff</span>
            <img alt="Brigade du kiff" class="h-10 w-auto" src="~/assets/images/brigade-du-kiff_amber-logo.png" />
          </NuxtLink>
          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 text-white transition-colors hover:text-secondaryBrand-200 lg:hidden"
            @click="mobileMenuOpen = true"
          >
            <span class="sr-only">Ouvrir le menu principal</span>
            <Bars3Icon class="size-6" aria-hidden="true" />
          </button>
          <div class="hidden lg:ml-6 lg:flex lg:items-center xl:ml-10">
            <div class="flex items-center gap-x-5 xl:gap-x-8">
              <NuxtLink
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                class="whitespace-nowrap text-[13px]/6 font-semibold text-white transition-colors hover:text-secondaryBrand-200 xl:text-sm"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
            <Popover v-slot="{ open, close }" class="relative ml-4 border-l border-white/20 pl-4 xl:ml-8 xl:pl-8">
              <PopoverButton
                class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-secondaryBrand-300 transition hover:bg-secondaryBrand-400/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300"
                :class="open || isProRoute ? 'border-secondaryBrand-300/60 bg-secondaryBrand-400/15' : 'border-secondaryBrand-300/30 bg-secondaryBrand-400/5'"
              >
                Pro
                <ChevronDownIcon class="size-4 transition-transform" :class="open ? 'rotate-180' : ''" aria-hidden="true" />
              </PopoverButton>
              <PopoverPanel :unmount="false" class="absolute right-0 z-10 mt-3 w-64 rounded-2xl border border-white/15 bg-brand-950 p-2 shadow-xl shadow-black/30">
                <NuxtLink
                  v-for="item in proNavigation" :key="item.name" :to="item.href"
                  class="block rounded-xl px-4 py-3 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondaryBrand-300"
                  :class="route.path === item.href ? 'bg-secondaryBrand-400/10 text-secondaryBrand-300' : 'text-white'"
                  @click="close()"
                >
                  <span class="block text-sm font-semibold">{{ item.name }}</span>
                  <span class="mt-1 block text-xs/5 text-brand-200">{{ item.description }}</span>
                </NuxtLink>
              </PopoverPanel>
            </Popover>
          </div>
          <div class="hidden lg:ml-4 lg:flex lg:flex-1 lg:justify-end xl:ml-6">
            <button
              v-if="showCommunityCta"
              type="button"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-secondaryBrand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400 xl:px-5 xl:text-sm"
              @click="openModal"
            >
              Rejoindre la communauté <span aria-hidden="true">→</span>
            </button>
            <NuxtLink
              v-else
              :to="accountPath"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-secondaryBrand-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-secondaryBrand-900/20 transition hover:bg-secondaryBrand-400"
            >
              Mon compte
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
    <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
      <div class="fixed inset-0 z-50" />
      <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-brand-950 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Brigade du kiff</span>
            <img class="h-8 w-auto" src="~/assets/images/brigade-du-kiff_amber-logo.png" alt="Brigade du kiff" />
          </NuxtLink>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-200" @click="mobileMenuOpen = false">
            <span class="sr-only">Fermer le menu principal</span>
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
            <Disclosure v-slot="{ open }" as="div" :default-open="isProRoute" class="py-6">
              <DisclosureButton class="flex w-full items-center justify-between rounded-xl border border-secondaryBrand-300/30 bg-secondaryBrand-400/5 px-4 py-3 text-base font-semibold text-secondaryBrand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondaryBrand-300">
                Pro
                <ChevronDownIcon class="size-5 transition-transform" :class="open ? 'rotate-180' : ''" aria-hidden="true" />
              </DisclosureButton>
              <DisclosurePanel :unmount="false" class="ml-4 mt-3 space-y-1 border-l border-secondaryBrand-300/30 pl-3">
                <NuxtLink
                  v-for="item in proNavigation" :key="item.name" :to="item.href"
                  class="block rounded-lg px-3 py-3 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondaryBrand-300"
                  :class="route.path === item.href ? 'bg-secondaryBrand-400/10 text-secondaryBrand-300' : 'text-white'"
                  @click="mobileMenuOpen = false"
                >
                  <span class="block text-base font-semibold">{{ item.name }}</span>
                  <span class="mt-1 block text-xs/5 text-brand-200">{{ item.description }}</span>
                </NuxtLink>
              </DisclosurePanel>
            </Disclosure>
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
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import AuthModal from './AuthModal.vue'

const props = withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})

const navigation = [
  { name: 'Les stages', href: '/stages-escalade' },
  { name: 'La Brigade du kiff', href: '/la-brigade' },
  { name: 'Carnet vertical', href: '/articles' },
  { name: 'Manifeste', href: '/manifeste' },
]
const proNavigation = [
  { name: 'Clubs', href: '/moniteurs-escalade-clubs-ffme-ffcam', description: 'Encadrement et formations pour les clubs' },
  { name: 'Partenaires', href: '/partenaires', description: 'Les partenaires de la Brigade du kiff' },
]
const route = useRoute()
const isProRoute = computed(() => proNavigation.some(item => route.path === item.href))

const { loggedIn, user } = useUserSession()
const { openModal } = useAuthModal()

const showCommunityCta = computed(() => !loggedIn.value)
const accountPath = computed(() => user.value?.role === 'GUIDE' ? '/moniteurs' : '/profil')

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
watch(() => route.path, () => { mobileMenuOpen.value = false })

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
