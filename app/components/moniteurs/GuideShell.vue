<script setup lang="ts">
import GuideSidebar from './GuideSidebar.vue'

defineProps<{ guide: any | null; currentPath: string }>()
const emit = defineEmits<{ logout: [] }>()
</script>

<template>
  <div class="guide-shell min-h-screen text-slate-900">
    <div class="flex min-h-screen flex-col lg:flex-row">
      <GuideSidebar :guide="guide" :current-path="currentPath" @logout="emit('logout')" />
      <main id="guide-content" class="guide-content min-w-0 flex-1 p-5 sm:p-8 lg:p-10 xl:p-12">
        <div class="mx-auto w-full max-w-[1380px] space-y-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.guide-shell {
  background: #f1f5f9;
}

.guide-content {
  background:
    radial-gradient(circle at 85% 0%, rgba(14, 165, 233, 0.08), transparent 30rem),
    linear-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.025) 1px, transparent 1px),
    #f8fafc;
  background-size: 32px 32px;
}

.guide-content :deep(h1) {
  font-weight: 700;
  letter-spacing: -0.025em;
}

.guide-content :deep(input[type='date']) {
  color-scheme: light;
}

.guide-content :deep(input.bg-slate-50:not([type='checkbox']):not([type='radio'])),
.guide-content :deep(select),
.guide-content :deep(textarea.bg-slate-50) {
  background-color: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.guide-content :deep(input.bg-slate-50:focus),
.guide-content :deep(select:focus),
.guide-content :deep(textarea.bg-slate-50:focus) {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
}
</style>
