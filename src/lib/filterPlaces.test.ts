import type { CategoryId } from './categories'
import { makePlace } from '../test/fixtures'
import { filterPlacesByCategory } from './filterPlaces'

describe('filterPlacesByCategory', () => {
  const restaurant = makePlace({ id: 'restaurant', category: 'restaurant' })
  const cafe = makePlace({ id: 'cafe', category: 'cafe' })
  const hiking = makePlace({ id: 'hiking', category: 'hiking' })
  const places = [restaurant, cafe, hiking]

  it('returns all places when every category is selected', () => {
    const selected = new Set<CategoryId>(['restaurant', 'cafe', 'hiking'])
    expect(filterPlacesByCategory(places, selected)).toEqual(places)
  })

  it('returns only places whose category is in the selection', () => {
    const selected = new Set<CategoryId>(['restaurant', 'hiking'])
    expect(filterPlacesByCategory(places, selected)).toEqual([restaurant, hiking])
  })

  it('returns an empty array when the selection is empty', () => {
    expect(filterPlacesByCategory(places, new Set<CategoryId>())).toEqual([])
  })

  it('returns an empty array when there are no places', () => {
    const selected = new Set<CategoryId>(['restaurant'])
    expect(filterPlacesByCategory([], selected)).toEqual([])
  })

  it('does not mutate the input array', () => {
    const input = [...places]
    filterPlacesByCategory(input, new Set<CategoryId>(['cafe']))
    expect(input).toEqual(places)
  })
})
