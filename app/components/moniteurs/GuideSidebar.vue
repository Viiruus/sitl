<script setup lang="ts">
import {
  ArrowLeftStartOnRectangleIcon, ArrowTopRightOnSquareIcon, Bars3Icon,
  ChartBarIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, GiftIcon,
  MapIcon, ShieldCheckIcon, Squares2X2Icon, UserCircleIcon, UsersIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{ guide: any | null; currentPath: string }>()
const emit = defineEmits<{ logout: [] }>()
const menuOpen = ref(false)
watch(() => props.currentPath, () => { menuOpen.value = false })

const navLinks = computed(() => [
  { label: 'Tableau de bord', to: '/moniteurs', icon: Squares2X2Icon },
  { label: 'Profil moniteur·ice', to: '/moniteurs/profil', icon: UserCircleIcon },
  { label: 'Mes aventures', to: '/moniteurs/aventures', icon: MapIcon },
  { label: 'Mes messages', to: '/moniteurs/messages', icon: ChatBubbleLeftRightIcon },
  { label: 'Mes articles', to: '/moniteurs/articles', icon: DocumentTextIcon },
  { label: 'Avantages partenaires', to: '/moniteurs/avantages-partenaires', icon: GiftIcon },
  { label: 'Grimpeur·euse·s inscrit·e·s', to: '/moniteurs/grimpeurs', icon: UsersIcon },
  { label: 'Pages moniteurs les plus vues', to: '/moniteurs/analytics', icon: ChartBarIcon },
  ...(props.guide?.isAdmin ? [{ label: 'Administration', to: '/admin', icon: ShieldCheckIcon }] : []),
])
const name = computed(() => props.guide?.fullName || 'Moniteur·ice')
const initials = computed(() => name.value.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join(''))
const isActive = (path: string) => path === props.currentPath || (path !== '/moniteurs' && props.currentPath.startsWith(path + '/'))
</script>

<template>
  <aside class="guide-sidebar sticky top-0 z-40 shrink-0 border-b border-slate-700/60 text-white lg:flex lg:h-screen lg:w-72 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r" @keydown.esc="menuOpen = false">
    <div class="flex items-center justify-between gap-4 p-5 lg:p-6">
      <NuxtLink to="/moniteurs" class="inline-flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
        <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-400 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/15">BK</span>
        <span>
          <span class="block text-sm font-bold text-white">Brigade du Kiff</span>
          <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">Espace moniteur</span>
        </span>
      </NuxtLink>
      <button type="button" :aria-expanded="menuOpen" aria-controls="guide-navigation" :aria-label="menuOpen ? 'Fermer le menu moniteur' : 'Ouvrir le menu moniteur'" class="rounded-xl border border-white/15 p-2 text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 lg:hidden" @click="menuOpen = !menuOpen">
        <XMarkIcon v-if="menuOpen" class="size-5" aria-hidden="true" />
        <Bars3Icon v-else class="size-5" aria-hidden="true" />
      </button>
    </div>

    <div id="guide-navigation" :class="menuOpen ? 'flex' : 'hidden'" class="max-h-[calc(100dvh-5rem)] flex-col gap-6 overflow-y-auto px-5 pb-5 lg:flex lg:max-h-none lg:flex-1 lg:overflow-visible lg:px-6 lg:pb-6">
      <div class="border-t border-white/10 pt-6">
        <p class="px-3 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Navigation</p>
        <nav aria-label="Espace moniteur" class="mt-3 grid gap-1.5">
          <NuxtLink v-for="item in navLinks" :key="item.to" :to="item.to" :aria-current="isActive(item.to) ? 'page' : undefined" class="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300" :class="isActive(item.to) ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'" @click="menuOpen = false">
            <component :is="item.icon" class="size-5 shrink-0" aria-hidden="true" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="space-y-4 lg:mt-auto">
        <NuxtLink to="/" class="flex items-center gap-3 rounded-xl border border-white/15 px-3.5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
          <ArrowTopRightOnSquareIcon class="size-5 shrink-0" aria-hidden="true" />
          Retourner sur la plateforme
        </NuxtLink>
        <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-xs font-bold text-sky-200">{{ initials }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-white" :title="name">{{ name }}</p>
            <p class="truncate text-xs text-slate-400" :title="guide?.baseLocation || 'Camp de base à définir'">{{ guide?.baseLocation || 'Camp de base à définir' }}</p>
            <p v-if="guide?.isAdmin" class="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">Administrateur</p>
          </div>
          <button type="button" aria-label="Se déconnecter" title="Se déconnecter" class="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300" @click="emit('logout')">
            <ArrowLeftStartOnRectangleIcon class="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.guide-sidebar {
  background: linear-gradient(180deg, #0b1728 0%, #08111e 100%);
}
</style>
