<script setup lang="ts">
import { buildDepartmentMapPoints, departmentMapConfig } from '~~/shared/utils/department-map'
import type { DepartmentMapCode, GuideMapSource, StageMapSource } from '~~/shared/utils/department-map'

const props = defineProps<{
  departmentCode: DepartmentMapCode
  guides: GuideMapSource[]
  stages: StageMapSource[]
}>()

const points = computed(() => buildDepartmentMapPoints(props.guides, props.stages))
const hasUnlocatedPlaces = computed(() => points.value.length < props.guides.length + props.stages.length)
</script>

<template>
  <div class="space-y-4">
    <ul class="flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-100/85" aria-label="Légende de la carte">
      <li class="inline-flex items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-full border border-white/40 bg-brand-800 text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" /></svg>
        </span>
        Camp de base des moniteurs
      </li>
      <li class="inline-flex items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-full bg-secondaryBrand-500 text-brand-950" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="m2 20 8-15 5 9 3-5 4 11ZM7 11l3 2 3-2" /></svg>
        </span>
        Lieux des stages
      </li>
      <li class="inline-flex items-center gap-2">
        <span class="w-7 border-t-2 border-secondaryBrand-300" aria-hidden="true" />
        Limite du département
      </li>
    </ul>
    <div class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <ClientOnly>
        <DepartmentMap :key="departmentCode" :department-code="departmentCode" :points="points" />
        <template #fallback>
          <div class="flex h-[26rem] items-center justify-center px-6 text-sm text-brand-100/75 sm:h-[32rem]" role="status">
            Chargement de la carte de {{ departmentMapConfig[departmentCode].name }}…
          </div>
        </template>
      </ClientOnly>
    </div>
    <p v-if="hasUnlocatedPlaces" class="text-sm leading-6 text-brand-100/70">
      Certains lieux ne sont pas encore indiqués sur la carte. Retrouve-les dans les profils et les stages ci-dessus.
    </p>
    <p v-else-if="!points.length" class="text-sm leading-6 text-brand-100/70">
      Les moniteurs et les stages apparaîtront ici dès que leurs lieux seront renseignés.
    </p>
  </div>
</template>
