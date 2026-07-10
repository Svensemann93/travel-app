import { describe, expect, it } from 'vitest'
import { normalizeBounds } from './publicBounds'

describe('normalizeBounds', () => {
  it('rounds outward so the fetched box always covers the viewport', () => {
    const result = normalizeBounds({
      minLat: 47.37691,
      maxLat: 47.38423,
      minLng: 8.54171,
      maxLng: 8.55989,
    })
    expect(result).toEqual({ minLat: 47.37, maxLat: 47.39, minLng: 8.54, maxLng: 8.56 })
  })

  it('leaves already-aligned bounds unchanged', () => {
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
    expect(result).toEqual({ minLat: -34.62, maxLat: -34.6, minLng: -58.45, maxLng: -58.41 })
  })
})
