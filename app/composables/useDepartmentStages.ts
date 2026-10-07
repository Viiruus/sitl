import type { Ref } from 'vue'
import type { EscaladeDepartmentCode } from '~~/shared/data/escalade-departments'
import { stageDepartmentProximity } from '~~/shared/utils/stage-department'
import type { DepartmentOutline, DepartmentStageSource } from '~~/shared/utils/stage-department'

export const useDepartmentStages = async <T extends DepartmentStageSource>(
  stages: Ref<T[]>,
  code: EscaladeDepartmentCode,
) => {
  // Include the outline in the Nuxt payload so SSR and hydration select the
  // same stages, and reuse the cached outline when navigating between pages.
  const { data: outline } = await useFetch<DepartmentOutline>(`/api/escalade/contours/${code}`, {
    key: `department-outline-${code}`,
  })
  const locatedStages = computed(() => stages.value.map(stage => ({
    stage, proximity: stageDepartmentProximity(stage, code, outline.value),
  })))
  const stagesInDepartment = computed(() => locatedStages.value
    .filter(({ proximity }) => proximity === 'department').map(({ stage }) => stage))
  const nextTimestamp = (stage: T) => {
    const timestamp = new Date(stage.nextSession?.dateDebut ?? '').getTime()
    return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY
  }
  const localStages = computed(() => locatedStages.value
    .filter(({ proximity }) => proximity !== null)
    .sort((a, b) => Number(b.proximity === 'department') - Number(a.proximity === 'department') ||
      nextTimestamp(a.stage) - nextTimestamp(b.stage))
    .map(({ stage }) => stage))

  return { localStages, stagesInDepartment }
}
