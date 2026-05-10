export type GuideGender = 'male' | 'female' | null | undefined

type GuideRoleLabelOptions = {
  capitalized?: boolean
  plural?: boolean
}

export const getGuideRoleLabel = (
  gender: GuideGender,
  options: GuideRoleLabelOptions = {},
) => {
  const { capitalized = false, plural = false } = options
  const label = gender === 'female'
    ? (plural ? 'monitrices' : 'monitrice')
    : (plural ? 'moniteurs' : 'moniteur')

  return capitalized ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label
}

export const getGuideRoleLabelWithArticle = (
  gender: GuideGender,
  options: { capitalized?: boolean } = {},
) => {
  const { capitalized = false } = options
  const label = gender === 'female' ? 'la monitrice' : 'le moniteur'
  return capitalized ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label
}

export const getGuideRoleReferenceLabel = (
  gender: GuideGender,
  options: { capitalized?: boolean } = {},
) => {
  const { capitalized = false } = options
  const label = gender === 'female' ? 'cette monitrice' : 'ce moniteur'
  return capitalized ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label
}

export const getGuideRoleDativeLabel = (
  gender: GuideGender,
  options: { capitalized?: boolean } = {},
) => {
  const { capitalized = false } = options
  const label = gender === 'female' ? 'à la monitrice' : 'au moniteur'
  return capitalized ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label
}
