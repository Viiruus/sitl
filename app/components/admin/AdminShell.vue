<script setup lang="ts">
import {
  ArrowLeftStartOnRectangleIcon,
  HomeIcon,
  MapIcon,
  Squares2X2Icon,
  TicketIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

defineProps<{ title: string; eyebrow?: string }>()
const route = useRoute()
const router = useRouter()
const { clear, fetch, user } = useUserSession()

const links = [
  { label: 'Vue d’ensemble', to: '/admin', icon: Squares2X2Icon },
  { label: 'Moniteurs & grimpeurs', to: '/admin/utilisateurs', icon: UsersIcon },
  { label: 'Stages & sessions', to: '/admin/stages', icon: MapIcon },
  { label: 'Réservations', to: '/admin/reservations', icon: TicketIcon },
]

const adminName = computed(() => [user.value?.firstName, user.value?.lastName].filter(Boolean).join(' ') || user.value?.email || 'Administrateur')
const adminInitials = computed(() => {
  const parts = adminName.value.split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'A'
})

const logout = async () => {
  await clear()
  await fetch()
  await router.push('/')
}
</script>

<template>
  <div class="admin-shell min-h-screen text-slate-900">
    <div class="flex min-h-screen flex-col lg:flex-row">
      <aside class="admin-sidebar border-b border-slate-700/60 p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:p-6">
        <div class="flex items-center justify-between gap-4">
          <NuxtLink to="/" class="group inline-flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-2xl bg-amber-400 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/15">BK</span>
            <span>
              <span class="block text-sm font-bold text-white">Brigade du Kiff</span>
              <span class="block text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">Back-office</span>
            </span>
          </NuxtLink>
          <NuxtLink to="/" class="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden" aria-label="Retour au site">
            <HomeIcon class="size-5" />
          </NuxtLink>
        </div>

        <div class="mt-7 border-t border-white/10 pt-6 lg:mt-10">
          <p class="px-3 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Navigation</p>
          <nav class="mt-3 grid gap-1.5">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition"
              :class="route.path === link.to || (link.to !== '/admin' && route.path.startsWith(`${link.to}/`))
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10'
                : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'"
            >
              <component :is="link.icon" class="size-5 shrink-0" />
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 lg:mt-auto">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-xs font-bold text-sky-200">{{ adminInitials }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-white">{{ adminName }}</p>
            <p class="text-xs text-slate-500">Administrateur</p>
          </div>
          <button class="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Se déconnecter" @click="logout">
            <ArrowLeftStartOnRectangleIcon class="size-5" />
          </button>
        </div>
      </aside>

      <main class="admin-content min-w-0 flex-1 p-5 sm:p-8 lg:p-10 xl:p-12">
        <header class="mx-auto mb-8 flex max-w-[1380px] flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-7">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-700">{{ eyebrow || 'Administration' }}</p>
            <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{{ title }}</h1>
          </div>
          <slot name="actions" />
        </header>
        <div class="mx-auto max-w-[1380px]">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  background: #f1f5f9;
  color: #0f172a;
}

.admin-sidebar {
  background: linear-gradient(180deg, #0b1728 0%, #08111e 100%);
}

.admin-content {
  background:
    radial-gradient(circle at 85% 0%, rgba(14, 165, 233, 0.08), transparent 30rem),
    linear-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.025) 1px, transparent 1px),
    #f8fafc;
  background-size: 32px 32px;
  color: #0f172a;
}

.admin-content :deep(form > section),
.admin-content :deep(.admin-panel) {
  background: #ffffff !important;
  border: 1px solid #e2e8f0;
  box-shadow: 0 18px 45px -32px rgba(15, 23, 42, 0.28);
  color: #0f172a;
}

.admin-content :deep(label) {
  color: #334155 !important;
}

.admin-content :deep(h2),
.admin-content :deep(h3) {
  color: #0f172a !important;
}

.admin-content :deep([class*='text-brand-']),
.admin-content :deep(.text-white) {
  color: #475569 !important;
}

.admin-content :deep([class*='text-red-']) {
  color: #b91c1c !important;
}

.admin-content :deep([class*='text-emerald-']) {
  color: #047857 !important;
}

.admin-content :deep(input:not([type='checkbox']):not([type='radio'])),
.admin-content :deep(select),
.admin-content :deep(textarea) {
  background-color: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.admin-content :deep(input::placeholder),
.admin-content :deep(textarea::placeholder) {
  color: #64748b !important;
}

.admin-content :deep(input:focus),
.admin-content :deep(select:focus),
.admin-content :deep(textarea:focus) {
  border-color: #fbbf24 !important;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
}

.admin-content :deep(option) {
  background: #ffffff;
  color: #0f172a;
}
</style>
