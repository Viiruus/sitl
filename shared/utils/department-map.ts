import { escaladeDepartmentEntries } from '../data/escalade-departments'
import type { EscaladeDepartmentCode } from '../data/escalade-departments'

export type DepartmentMapCode = EscaladeDepartmentCode

export type GuideMapSource = {
  id: string | number
  slug: string
  fullName: string
  baseLocation?: string | null
  baseLatitude?: unknown
  baseLongitude?: unknown
}

export type StageMapSource = {
  id: string | number
  slug: string
  titre: string
  lieuLabel?: string | null
  latitude?: unknown
  longitude?: unknown
}

export type DepartmentMapPoint = {
  id: string
  kind: 'guide' | 'stage'
  title: string
  locationLabel: string
  latitude: number
  longitude: number
  url: string
}

export const departmentMapConfig = Object.fromEntries(escaladeDepartmentEntries.map(([code, department]) => [
  code, { name: department.name, outlineUrl: `/maps/departments/${department.slug}.geojson` },
])) as Record<DepartmentMapCode, { name: string; outlineUrl: string }>

export const hasMapCoordinates = (point: {
  latitude?: unknown
  longitude?: unknown
}): point is { latitude: number; longitude: number } =>
  typeof point.latitude === 'number' && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90 &&
  typeof point.longitude === 'number' && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180

export const buildDepartmentMapPoints = (
  guides: GuideMapSource[],
  stages: StageMapSource[],
): DepartmentMapPoint[] => [
  ...guides.flatMap(guide => {
    const coordinates = { latitude: guide.baseLatitude, longitude: guide.baseLongitude }
    if (!hasMapCoordinates(coordinates) || !guide.slug) return []
    return [{
      id: `guide-${guide.id}`,
      kind: 'guide' as const,
      title: guide.fullName,
      locationLabel: guide.baseLocation || 'Camp de base',
      ...coordinates,
      url: `/moniteurs/${encodeURIComponent(guide.slug)}`,
    }]
  }),
  ...stages.flatMap(stage => {
    if (!hasMapCoordinates(stage) || !stage.slug) return []
    return [{
      id: `stage-${stage.id}`,
      kind: 'stage' as const,
      title: stage.titre,
      locationLabel: stage.lieuLabel || 'Lieu du stage',
      latitude: stage.latitude,
      longitude: stage.longitude,
      url: `/stages-escalade/${encodeURIComponent(stage.slug)}`,
    }]
  }),
]
