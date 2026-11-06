export type GuideMapLocation = {
  id: number
  baseLatitude?: number | null
  baseLongitude?: number | null
}

export type GuideMapMarker = {
  id: number
  x: number
  y: number
  anchorX: number
  anchorY: number
}

// Même projection que la représentation de France des cards moniteurs.
export function projectGuideLocation(guide: GuideMapLocation) {
  if (typeof guide.baseLatitude !== 'number' || typeof guide.baseLongitude !== 'number') return null
  if (!Number.isFinite(guide.baseLatitude) || !Number.isFinite(guide.baseLongitude)) return null
  const x = 10 + (guide.baseLongitude + 4.59235) * 5.56
  const y = 5 + (51.148506 - guide.baseLatitude) * 8
  if (x < 4 || x > 96 || y < 4 || y > 86) return null
  return { x, y }
}

// Décaler les portraits, sans déplacer leur ancrage géographique. L'ordre par ID
// évite que la sélection ou le tri aléatoire des profils modifie la carte.
export function layoutGuideMapMarkers(guides: GuideMapLocation[], minimumDistance = 8): GuideMapMarker[] {
  const placed: GuideMapMarker[] = []
  const gap = Math.min(20, Math.max(5, minimumDistance))
  const anchors = [...guides].sort((a, b) => a.id - b.id).flatMap(guide => {
    const point = projectGuideLocation(guide)
    return point ? [{ id: guide.id, ...point }] : []
  })
  for (const anchor of anchors) {
    let position: { x: number; y: number } | null = null
    // Garder un trait visible et protéger tous les points GPS, y compris ceux
    // des autres moniteurs : aucun portrait ne doit les recouvrir.
    for (let radius = gap * 1.2; radius <= 140 && !position; radius += gap / 3) {
      const steps = Math.max(12, Math.ceil(2 * Math.PI * radius / (gap / 2)))
      for (let step = 0; step < steps; step++) {
        const angle = step * Math.PI * (3 - Math.sqrt(5)) + anchor.id * 0.7
        const x = anchor.x + Math.cos(angle) * radius
        const y = anchor.y + Math.sin(angle) * radius
        if (x < 9 || x > 91 || y < 9 || y > 93) continue
        if (anchors.some(point => Math.hypot(x - point.x, y - point.y) < gap / 2 + 1.5)) continue
        if (placed.some(other => Math.hypot(x - other.x, y - other.y) < gap)) continue
        position = { x, y }
        break
      }
    }
    // Si la carte est saturée, le profil reste accessible dans la liste complémentaire.
    if (position) placed.push({ id: anchor.id, ...position, anchorX: anchor.x, anchorY: anchor.y })
  }
  if (placed.length === anchors.length) return placed

  // Sur les petits écrans, une grille en quinconce exploite aussi les espaces
  // libres au nord de la carte lorsque les camps de base sont très regroupés.
  let best = placed
  const rowHeight = gap * Math.sqrt(3) / 2
  for (const shiftX of [0, gap / 3, gap * 2 / 3]) {
    for (const shiftY of [0, rowHeight / 3]) {
      const available: { x: number; y: number }[] = []
      for (let row = 0, y = 9 + shiftY; y <= 93; row++, y += rowHeight) {
        for (let x = 9 + shiftX + (row % 2) * gap / 2; x <= 91; x += gap) {
          if (anchors.every(point => Math.hypot(x - point.x, y - point.y) >= gap / 2 + 1.5)) available.push({ x, y })
        }
      }
      const packed: GuideMapMarker[] = []
      for (const anchor of anchors) {
        available.sort((a, b) => Math.hypot(a.x - anchor.x, a.y - anchor.y) - Math.hypot(b.x - anchor.x, b.y - anchor.y))
        const index = available.findIndex(point => Math.hypot(point.x - anchor.x, point.y - anchor.y) >= gap * 1.2)
        if (index < 0) continue
        const point = available.splice(index, 1)[0]!
        packed.push({ id: anchor.id, ...point, anchorX: anchor.x, anchorY: anchor.y })
      }
      if (packed.length > best.length) best = packed
      if (best.length === anchors.length) return best
    }
  }
  return best
}
