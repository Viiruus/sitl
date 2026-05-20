<template>
  <div
    class="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]"
    aria-hidden="true"
  >
    <div
      class="absolute left-1/2 top-1/2 flex w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] items-center justify-center border-[10px] border-red-600/75 bg-neutral-950/62 px-6 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.24)] sm:border-[12px] sm:py-4"
    >
      <div class="absolute inset-[6px] border border-white/6 sm:inset-[8px]" />
      <div class="absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.03)_0_4px,transparent_4px_12px)] opacity-20" />
      <span
        class="relative block text-center text-[2.1rem] font-black uppercase leading-none tracking-[0.08em] text-red-500/80 [text-shadow:0_2px_0_rgba(0,0,0,0.72),3px_3px_0_rgba(0,0,0,0.28)] sm:text-[3rem] lg:text-[3.5rem]"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Complet',
  },
)
</script>
