import { describe, expect, it } from 'vitest'
import { dedupePoints, visitedPlacesToPoints, type ShowcasePoint } from './showcasePoints'
import type { Place } from '../types/place'

function place(id: string, visits: number): Place {
  return {
    id,
    name: `Place ${id}`,
    category: 'other',
    latitude: 1,
    longitude: 2,
    description: null,
    website_url: null,
    photos: [],
    visits: Array.from({ length: visits }, () => ({})),
  } as unknown as Place
}

function point(id: string): ShowcasePoint {
  return { id } as ShowcasePoint
}

describe('visitedPlacesToPoints', () => {
  it('keeps only places with at least one visit', () => {
    const result = visitedPlacesToPoints([place('a', 0), place('b', 2), place('c', 1)])
    expect(result.map((p) => p.id)).toEqual(['b', 'c'])
  })

  it('returns an empty list when nothing was visited', () => {
    expect(visitedPlacesToPoints([place('a', 0)])).toEqual([])
  })
})

describe('dedupePoints', () => {
  it('drops repeated ids and keeps the first', () => {
    expect(dedupePoints([point('a'), point('b'), point('a')]).map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('leaves distinct points untouched', () => {
    expect(dedupePoints([point('a'), point('b')])).toHaveLength(2)
  })
})
