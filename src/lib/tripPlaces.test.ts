import { describe, expect, it } from 'vitest'
import { toTripPlace } from './tripPlaces'
import type { TripPlaceRow } from './tripPlaces'
import { makePlace, makeTripPlace } from '../test/fixtures'

function row(overrides: Partial<TripPlaceRow> = {}): TripPlaceRow {
  return { ...makeTripPlace(), place: makePlace(), ...overrides }
}

describe('toTripPlace', () => {
  it('keeps a place the owner can read', () => {
    const tripPlace = toTripPlace(row())
    expect(tripPlace.is_foreign).toBe(false)
    expect(tripPlace.place.name).toBe('Test Place')
    expect(tripPlace.place.visits).toHaveLength(1)
  })

  it('rebuilds a place from the snapshot when the owner cannot read it', () => {
    const tripPlace = toTripPlace(
      row({
        place: null,
        place_id: 'foreign-1',
        place_name: 'Bockmattlipass',
        place_latitude: 47.05,
        place_longitude: 8.95,
        place_category: 'hiking',
        place_country_code: 'CH',
      }),
    )
    expect(tripPlace.is_foreign).toBe(true)
    expect(tripPlace.place.id).toBe('foreign-1')
    expect(tripPlace.place.name).toBe('Bockmattlipass')
    expect(tripPlace.place.latitude).toBe(47.05)
    expect(tripPlace.place.category).toBe('hiking')
    expect(tripPlace.place.country_code).toBe('CH')
    expect(tripPlace.place.visits).toEqual([])
    expect(tripPlace.place.photos).toEqual([])
  })

  it('falls back to the default category when the snapshot predates it', () => {
    const tripPlace = toTripPlace(row({ place: null, place_category: null }))
    expect(tripPlace.place.category).toBe('other')
  })
})
