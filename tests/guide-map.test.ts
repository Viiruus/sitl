import assert from 'node:assert/strict'
import { test } from 'node:test'
import { layoutGuideMapMarkers, projectGuideLocation } from '../shared/utils/guide-map'

test('les coordonnées absentes ou hors de la carte ne deviennent pas des points inventés', () => {
  for (const guide of [{ id: 1 }, { id: 2, baseLatitude: null, baseLongitude: null }, { id: 3, baseLatitude: NaN, baseLongitude: 5 }, { id: 4, baseLatitude: 0, baseLongitude: 0 }, { id: 5, baseLatitude: 45, baseLongitude: Infinity }]) {
    assert.equal(projectGuideLocation(guide), null)
  }
  assert.equal(layoutGuideMapMarkers([{ id: 1 }]).length, 0)
})

test('les portraits d’un même secteur restent séparés et reliés à leur vrai point, sur mobile et ordinateur', () => {
  const guides = Array.from({ length: 19 }, (_, i) => ({ id: i + 1, baseLatitude: 45.1842, baseLongitude: 5.7155 }))
  for (const minimumDistance of [8, 16, 18.5]) {
    const markers = layoutGuideMapMarkers(guides, minimumDistance)
    assert.equal(markers.length, 19)
    for (const marker of markers) {
      const point = projectGuideLocation(guides.find(g => g.id === marker.id)!)!
      assert.equal(marker.anchorX, point.x)
      assert.equal(marker.anchorY, point.y)
      assert.ok(marker.x >= 9 && marker.x <= 91 && marker.y >= 9 && marker.y <= 93)
      assert.ok(Math.hypot(marker.x - point.x, marker.y - point.y) >= minimumDistance * 1.2 - 1e-9)
      for (const guide of guides) {
        const anchor = projectGuideLocation(guide)!
        assert.ok(Math.hypot(marker.x - anchor.x, marker.y - anchor.y) >= minimumDistance / 2 + 1.5 - 1e-9)
      }
      for (const other of markers.filter(m => m.id !== marker.id)) {
        assert.ok(Math.hypot(marker.x - other.x, marker.y - other.y) >= minimumDistance - 1e-9)
      }
    }
    assert.deepEqual(layoutGuideMapMarkers([...guides].reverse(), minimumDistance), markers)
  }
})

test('les portraits laissent aussi visibles les points GPS des autres moniteurs', () => {
  const guides = Array.from({ length: 19 }, (_, i) => ({ id: i + 1, baseLatitude: 43.5 + i % 4 * 0.5, baseLongitude: 3 + Math.floor(i / 4) * 0.7 }))
  for (const gap of [8, 18.5]) {
    const markers = layoutGuideMapMarkers(guides, gap)
    assert.equal(markers.length, 19)
    for (const marker of markers) {
      for (const guide of guides) {
        const point = projectGuideLocation(guide)!
        assert.ok(Math.hypot(marker.x - point.x, marker.y - point.y) >= gap / 2 + 1.5 - 1e-9)
      }
    }
  }
})
