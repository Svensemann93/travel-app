import { describe, expect, it } from 'vitest'
import { sortWishlist } from './wishlist'
import type { CategoryId } from './categories'
import { makePublicPlace } from '../test/fixtures'

const LABELS: Partial<Record<CategoryId, string>> = {
  hiking: 'Wandern',
  restaurant: 'Restaurant',
  other: 'Sonstiges',
}
const label = (id: CategoryId) => LABELS[id] ?? id

const zermatt = makePublicPlace({
  id: 'a',
  name: 'Zermatt',
  country_code: 'CH',
  category: 'hiking',
  avg_rating: 3,
  wished_on: '2026-07-01T00:00:00.000Z',
})
const kyoto = makePublicPlace({
  id: 'b',
  name: 'Kyoto',
  country_code: 'JP',
  category: 'other',
  avg_rating: 5,
  wished_on: '2026-07-05T00:00:00.000Z',
})
const bern = makePublicPlace({
  id: 'c',
  name: 'Bern',
  country_code: 'CH',
  category: 'restaurant',
  avg_rating: null,
  wished_on: '2026-07-03T00:00:00.000Z',
})
const places = [zermatt, kyoto, bern]

describe('sortWishlist', () => {
  it('puts the most recently wished first by default', () => {
    expect(sortWishlist(places, 'added', 'de', label).map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by name', () => {
    expect(sortWishlist(places, 'name', 'de', label).map((p) => p.id)).toEqual(['c', 'b', 'a'])
  })

  it('sorts by rating and pushes unrated places to the end', () => {
    expect(sortWishlist(places, 'rating', 'de', label).map((p) => p.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by the translated category name, not the raw id', () => {
    expect(sortWishlist(places, 'category', 'de', label).map((p) => p.id)).toEqual(['c', 'b', 'a'])
  })

  it('breaks a category tie on the place name', () => {
    const alps = makePublicPlace({
      id: 'd',
      name: 'Alpstein',
      category: 'hiking',
    })
    const sorted = sortWishlist([zermatt, alps], 'category', 'de', label)
    expect(sorted.map((p) => p.id)).toEqual(['d', 'a'])
  })

  it('does not mutate the input', () => {
    const input = [...places]
    sortWishlist(input, 'name', 'de', label)
    expect(input.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })
})
