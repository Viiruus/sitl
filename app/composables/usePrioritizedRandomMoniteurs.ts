import type { Ref } from 'vue'

const shuffled = <T>(values: T[]) => {
  const result = [...values]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }

  return result
}

const hasUpcomingStage = (moniteur: any) =>
  Number(moniteur?.upcomingStageCount || 0) > 0 || Boolean(moniteur?.nextStage?.dateDebut)

const randomizedIds = (moniteurs: any[]) => [
  ...shuffled(moniteurs.filter(hasUpcomingStage)),
  ...shuffled(moniteurs.filter(moniteur => !hasUpcomingStage(moniteur))),
].map(moniteur => moniteur.id)

export const usePrioritizedRandomMoniteurs = (
  moniteurs: Readonly<Ref<any[]>>,
  stateKey: string,
) => {
  const orderedIds = useState<Array<number | string>>(stateKey, () =>
    randomizedIds(moniteurs.value),
  )

  watch(moniteurs, (values) => {
    const availableIds = new Set(values.map(moniteur => moniteur.id))
    const orderIsCurrent =
      orderedIds.value.length === availableIds.size &&
      orderedIds.value.every(id => availableIds.has(id))

    if (!orderIsCurrent) {
      orderedIds.value = randomizedIds(values)
    }
  }, { immediate: true })

  return computed(() => {
    const randomRank = new Map(orderedIds.value.map((id, index) => [id, index]))

    return [...moniteurs.value].sort((left, right) => {
      const stagePriority = Number(hasUpcomingStage(right)) - Number(hasUpcomingStage(left))
      if (stagePriority !== 0) return stagePriority
      return (randomRank.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (randomRank.get(right.id) ?? Number.MAX_SAFE_INTEGER)
    })
  })
}
