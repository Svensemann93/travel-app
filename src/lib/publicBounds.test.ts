import { describe, expect, it } from 'vitest'
import { boundsContain, padBounds } from './publicBounds'

const viewport = { minLat: 10, maxLat: 20, minLng: 30, maxLng: 50 }

describe('padBounds', () => {
  it('expands bounds around the center by the factor', () => {
    expect(padBounds(viewport, 2)).toEqual({ minLat: 5, maxLat: 25, minLng: 20, maxLng: 60 })
  })

  it('is a no-op at factor 1', () => {
    expect(padBounds(viewport, 1)).toEqual(viewport)
  })
})

describe('boundsContain', () => {
  it('is true when the inner box sits fully within the outer box', () => {
    expect(boundsContain(padBounds(viewport, 2), viewport)).toBe(true)
  })

  it('is false when the inner box extends outside the outer box', () => {
    expect(boundsContain(viewport, { minLat: 9, maxLat: 20, minLng: 30, maxLng: 50 })).toBe(false)
  })
})
