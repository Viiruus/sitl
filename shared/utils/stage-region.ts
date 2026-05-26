export type StageRegionBounds = {
  value: string
  label: string
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export const STAGE_REGION_BOUNDS: StageRegionBounds[] = [
  { value: 'corse', label: 'Corse', minLat: 41.3, maxLat: 43.1, minLng: 8.4, maxLng: 9.7 },
  { value: 'bretagne', label: 'Bretagne', minLat: 47.2, maxLat: 49.2, minLng: -5.3, maxLng: -1.0 },
  { value: 'normandie', label: 'Normandie', minLat: 48.1, maxLat: 50.2, minLng: -1.9, maxLng: 1.9 },
  { value: 'hauts-de-france', label: 'Hauts-de-France', minLat: 49.5, maxLat: 51.2, minLng: 1.2, maxLng: 4.4 },
  { value: 'ile-de-france', label: 'Île-de-France', minLat: 48.0, maxLat: 49.3, minLng: 1.4, maxLng: 3.7 },
  { value: 'grand-est', label: 'Grand Est', minLat: 47.4, maxLat: 50.3, minLng: 3.4, maxLng: 8.4 },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire', minLat: 46.2, maxLat: 48.8, minLng: -2.8, maxLng: 0.9 },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire', minLat: 46.3, maxLat: 48.9, minLng: 0.0, maxLng: 3.2 },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté', minLat: 46.1, maxLat: 48.7, minLng: 2.8, maxLng: 7.2 },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine', minLat: 42.7, maxLat: 47.3, minLng: -1.8, maxLng: 2.6 },
  { value: 'occitanie', label: 'Occitanie', minLat: 42.3, maxLat: 45.1, minLng: -0.4, maxLng: 4.9 },
  { value: 'provence-alpes-cote-d-azur', label: 'Provence-Alpes-Côte d’Azur', minLat: 43.0, maxLat: 45.2, minLng: 4.2, maxLng: 7.8 },
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes', minLat: 44.0, maxLat: 46.9, minLng: 3.6, maxLng: 7.3 },
]

export const getStageRegionForCoordinates = (latitude?: number | null, longitude?: number | null) => {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  return STAGE_REGION_BOUNDS.find(
    (region) =>
      latitude >= region.minLat &&
      latitude <= region.maxLat &&
      longitude >= region.minLng &&
      longitude <= region.maxLng,
  ) ?? null
}
