import { describe, expect, it } from 'vitest'
import { groupWishlistByCountry, sortWishlist } from './wishlist'
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
    const alps = makePublicPlace({ id: 'd', name: 'Alpstein', category: 'hiking' })
    const sorted = sortWishlist([zermatt, alps], 'category', 'de', label)
    expect(sorted.map((p) => p.id)).toEqual(['d', 'a'])
  })

  it('does not mutate the input', () => {
    const input = [...places]
    sortWishlist(input, 'name', 'de', label)
    expect(input.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('groupWishlistByCountry', () => {
  it('groups by country and names the group in the current language', () => {
    const groups = groupWishlistByCountry(places, 'de')
    expect(groups.map((g) => g.code)).toEqual(['JP', 'CH'])
    expect(groups[0].name).toBe('Japan')
    expect(groups[1].name).toBe('Schweiz')
  })

  it('names the group in English too', () => {
    expect(groupWishlistByCountry([zermatt], 'en')[0].name).toBe('Switzerland')
  })

  it('keeps the incoming order inside a group', () => {
    const groups = groupWishlistByCountry(sortWishlist(places, 'name', 'de', label), 'de')
    const swiss = groups.find((g) => g.code === 'CH')
    expect(swiss?.places.map((p) => p.id)).toEqual(['c', 'a'])
  })

  it('puts places without a country last', () => {
    const nowhere = makePublicPlace({ id: 'd', name: 'Somewhere', country_code: null })
    const groups = groupWishlistByCountry([nowhere, kyoto], 'de')
    expect(groups.map((g) => g.code)).toEqual(['JP', null])
    expect(groups[1].name).toBe('')
  })
})
