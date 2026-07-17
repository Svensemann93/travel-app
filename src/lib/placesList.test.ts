import { describe, expect, it } from 'vitest'
import { searchPlaces, sortPlaces } from './placesList'
import type { CategoryId } from './categories'
import { makePlace, makePlaceVisit } from '../test/fixtures'

const LABELS: Partial<Record<CategoryId, string>> = {
  hiking: 'Wandern',
  restaurant: 'Restaurant',
  other: 'Sonstiges',
}
const label = (id: CategoryId) => LABELS[id] ?? id

const zurich = makePlace({
  id: 'a',
  name: 'Zürich Hauptbahnhof',
  country_code: 'CH',
  category: 'other',
  visits: [makePlaceVisit({ rating: 3, visited_on: '2025-05-01' })],
})
const kyoto = makePlace({
  id: 'b',
  name: 'Kyoto',
  country_code: 'JP',
  category: 'restaurant',
  visits: [makePlaceVisit({ rating: 5, visited_on: '2026-01-10' })],
})
const bern = makePlace({
  id: 'c',
  name: 'Bern',
  country_code: 'CH',
  category: 'hiking',
  visits: [makePlaceVisit({ rating: null, visited_on: '2025-09-20' })],
})
const places = [zurich, kyoto, bern]

describe('searchPlaces', () => {
  it('matches part of a name, ignoring case', () => {
    expect(searchPlaces(places, 'ber').map((p) => p.id)).toEqual(['c'])
  })

  it('ignores accents so a plain keyboard finds Zürich', () => {
    expect(searchPlaces(places, 'zurich').map((p) => p.id)).toEqual(['a'])
  })

  it('returns everything for an empty or blank query', () => {
    expect(searchPlaces(places, '')).toHaveLength(3)
    expect(searchPlaces(places, '   ')).toHaveLength(3)
  })

  it('returns nothing when nothing matches', () => {
    expect(searchPlaces(places, 'lissabon')).toEqual([])
  })

  it('does not search the description', () => {
    const withText = makePlace({ id: 'd', name: 'Pier', description: 'Bockmattli ist schön' })
    expect(searchPlaces([withText], 'bockmattli')).toEqual([])
  })
})

describe('sortPlaces', () => {
  it('puts the most recent travel date first by default', () => {
    expect(sortPlaces(places, 'visited', 'de', label).map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })

  it('falls back to the visit date when no travel date was given', () => {
    const undated = makePlace({
      id: 'd',
      name: 'Undated',
      visits: [makePlaceVisit({ visited_on: null, created_at: '2026-06-01T00:00:00.000Z' })],
    })
    expect(sortPlaces([zurich, undated], 'visited', 'de', label).map((p) => p.id)).toEqual([
      'd',
      'a',
    ])
  })

  it('sorts by name', () => {
    expect(sortPlaces(places, 'name', 'de', label).map((p) => p.id)).toEqual(['c', 'b', 'a'])
  })

  it('sorts by rating and pushes unrated places to the end', () => {
    expect(sortPlaces(places, 'rating', 'de', label).map((p) => p.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by the translated category name, not the raw id', () => {
    expect(sortPlaces(places, 'category', 'de', label).map((p) => p.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by the translated country name and puts places without one last', () => {
    const nowhere = makePlace({ id: 'd', name: 'Nowhere', country_code: null })
    const sorted = sortPlaces([nowhere, ...places], 'country', 'de', label)
    expect(sorted.map((p) => p.id)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('does not mutate the input', () => {
    const input = [...places]
    sortPlaces(input, 'name', 'de', label)
    expect(input.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })
})
