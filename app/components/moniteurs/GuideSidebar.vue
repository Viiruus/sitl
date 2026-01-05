<script setup lang="ts">
const props = defineProps<{
  guide: any | null
  currentPath: string
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const navLinks = [
  { label: 'Tableau de bord', to: '/moniteurs' },
  { label: 'Profil guide', to: '/moniteurs/profil' },
  { label: 'Mes aventures', to: '/moniteurs/aventures' },
  { label: 'Suggestions & bookings', to: '/moniteurs/aventures#demandes', disabled: true },
]

const isActive = (link: string) => {
  const basePath = link.split('#')[0]
  return basePath === props.currentPath
}
</script>

<template>
  <aside class="w-full rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 lg:w-72">
    <div class="flex flex-col gap-4">
      <div class="rounded-2xl bg-white/5 p-4 text-sm">
        <p class="text-xs uppercase tracking-[0.3em] text-secondaryBrand-200/70">
          Identité
        </p>
        <p class="mt-2 text-lg font-semibold text-white">
          {{ guide?.fullName || 'Moniteur' }}
        </p>
        <p class="text-brand-100/70">
          {{ guide?.baseLocation || 'Camp de base à définir' }}
        </p>
      </div>
      <nav class="flex flex-col gap-2 text-sm">
        <NuxtLink
          v-for="item in navLinks"
          :key="item.label"
          :to="item.to"
          :class="[
            'rounded-xl px-3 py-2 transition',
            item.disabled
              ? 'cursor-not-allowed text-brand-500/60'
              : (isActive(item.to)
                  ? 'bg-secondaryBrand-500/90 text-brand-950'
                  : 'text-brand-100/80 hover:bg-white/5'),
          ]"
          :aria-disabled="item.disabled"
          :tabindex="item.disabled ? -1 : 0"
          @click="(event) => { if (item.disabled) event.preventDefault() }"
        >
          {{ item.label }}
          <span v-if="item.disabled" class="text-[10px] ml-2 uppercase tracking-[0.3em] text-brand-500/70">Bientôt</span>
        </NuxtLink>
      </nav>
      <NuxtLink
        to="/"
        class="rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 text-center"
      >
        Retourner sur la plateforme
      </NuxtLink>
      <button
        type="button"
        class="mt-4 rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
        @click="emit('logout')"
      >
        Se déconnecter
      </button>
    </div>
  </aside>
</template>
