import type { EscaladeDepartmentCode } from '../data/escalade-departments'
import { hasMapCoordinates } from './department-map'
import { stageIsLocatedInDepartment } from './seo-hubs'

type Position = [number, number]
type Polygon = Position[][]
export type DepartmentOutline = {
  type: 'Feature'
  geometry: { type: 'Polygon'; coordinates: Polygon } | { type: 'MultiPolygon'; coordinates: Polygon[] }
}

export type DepartmentStageSource = {
  lieuLabel?: string | null
  latitude?: unknown
  longitude?: unknown
  nextSession?: { dateDebut?: string | Date | null } | null
}

// A nearby stage is at most 20 km from the actual boundary, not anywhere in
// a neighbouring department. Distances are geographic, not travel times.
export const DEPARTMENT_STAGE_BORDER_KM = 20

const insideRing = ([longitude, latitude]: Position, ring: Position[]) => {
  let inside = false
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x, y] = ring[index]
    const [previousX, previousY] = ring[previous]
    if ((y > latitude) !== (previousY > latitude) &&
      longitude < (previousX - x) * (latitude - y) / (previousY - y) + x) inside = !inside
  }
  return inside
}

export const distanceToDepartmentKm = (point: Position, outline: DepartmentOutline) => {
  const polygons = outline.geometry.type === 'Polygon' ? [outline.geometry.coordinates] : outline.geometry.coordinates
  if (polygons.some(polygon => polygon.length && insideRing(point, polygon[0]) &&
    !polygon.slice(1).some(hole => insideRing(point, hole)))) return 0

  // Project short boundary segments into kilometres around the stage. This
  // keeps the same proximity rule for small boundaries, islands and enclaves.
  const latitudeScale = Math.PI * 6371.0088 / 180
  const longitudeScale = latitudeScale * Math.cos(point[1] * Math.PI / 180)
  let minimumSquaredDistance = Number.POSITIVE_INFINITY
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (let index = 0; index < ring.length; index++) {
        const start = ring[index]
        const end = ring[(index + 1) % ring.length]
        const x = (start[0] - point[0]) * longitudeScale
        const y = (start[1] - point[1]) * latitudeScale
        const dx = (end[0] - start[0]) * longitudeScale
        const dy = (end[1] - start[1]) * latitudeScale
        const lengthSquared = dx * dx + dy * dy
        const projection = lengthSquared ? Math.max(0, Math.min(1, -(x * dx + y * dy) / lengthSquared)) : 0
        minimumSquaredDistance = Math.min(minimumSquaredDistance, (x + projection * dx) ** 2 + (y + projection * dy) ** 2)
      }
    }
  }
  return Math.sqrt(minimumSquaredDistance)
}

export const stageDepartmentProximity = (
  stage: DepartmentStageSource,
  code: EscaladeDepartmentCode,
  outline?: DepartmentOutline | null,
): 'department' | 'border' | null => {
  if (outline && hasMapCoordinates(stage)) {
    const distance = distanceToDepartmentKm([stage.longitude, stage.latitude], outline)
    if (distance < 0.000001) return 'department'
    return distance <= DEPARTMENT_STAGE_BORDER_KM ? 'border' : null
  }
  // A guide's address is never a substitute for the stage's destination.
  return stageIsLocatedInDepartment(stage, code) ? 'department' : null
}

export const withDepartmentStagePreviews = <
  Guide extends { slug: string },
  Stage extends DepartmentStageSource & { slug: string; titre: string; guideSlug?: string | null },
>(guides: Guide[], stages: Stage[]) => guides.map(guide => {
  const upcoming = stages.filter(stage => stage.guideSlug === guide.slug && stage.nextSession?.dateDebut)
    .sort((a, b) => new Date(a.nextSession!.dateDebut!).getTime() - new Date(b.nextSession!.dateDebut!).getTime())
  const nextStage = upcoming[0]
  return {
    ...guide,
    upcomingStageCount: upcoming.length,
    nextStage: nextStage ? { slug: nextStage.slug, titre: nextStage.titre, ...nextStage.nextSession } : null,
  }
})
