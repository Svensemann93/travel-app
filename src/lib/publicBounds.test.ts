import { describe, expect, it } from 'vitest'
import { normalizeBounds } from './publicBounds'

describe('normalizeBounds', () => {
  it('snaps outward to the 0.05 grid so the box always covers the viewport', () => {
    const result = normalizeBounds({
      minLat: 47.37691,
      maxLat: 47.38423,
      minLng: 8.54171,
      maxLng: 8.55989,
    })
    expect(result).toEqual({ minLat: 47.35, maxLat: 47.4, minLng: 8.5, maxLng: 8.6 })
  })

  it('leaves grid-aligned bounds unchanged', () => {
    const bounds = { minLat: 47.3, maxLat: 47.4, minLng: 8.5, maxLng: 8.6 }
    expect(normalizeBounds(bounds)).toEqual(bounds)
  })

  it('handles negative coordinates', () => {
    const result = normalizeBounds({
      minLat: -34.61521,
      maxLat: -34.6009,
      minLng: -58.44182,
      maxLng: -58.41,
    })
    expect(result).toEqual({ minLat: -34.65, maxLat: -34.6, minLng: -58.45, maxLng: -58.4 })
  })

  it('rounds strictly outward for a thin box straddling a 0.05 grid line', () => {
    const result = normalizeBounds({
      minLat: 47.34999,
      maxLat: 47.35001,
      minLng: 8.54999,
      maxLng: 8.55001,
    })
    expect(result).toEqual({ minLat: 47.3, maxLat: 47.4, minLng: 8.5, maxLng: 8.6 })
  })
})
