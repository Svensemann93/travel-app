import { describe, expect, it } from 'vitest'
import { mergePublicPhotos, placeIdsMissingPhotos, toTripPlace } from './tripPlaces'
import type { TripPlaceRow } from './tripPlaces'
import { makePlace, makePlacePhoto, makeTripPlace } from '../test/fixtures'

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

describe('toTripPlace with public photos', () => {
  it('folds public_photos into the rebuilt snapshot place', () => {
    const photo = makePlacePhoto({ id: 'pub', place_id: 'foreign', url: 'pub.jpg' })
    const tripPlace = toTripPlace({
      ...makeTripPlace({ place_id: 'foreign', place_name: 'Plattenberg' }),
      place: null,
      public_photos: [photo],
    })
    expect(tripPlace.is_foreign).toBe(true)
    expect(tripPlace.place.photos).toEqual([photo])
  })
})

describe('placeIdsMissingPhotos', () => {
  it('lists places that came back with no photos', () => {
    const rows = [
      { ...makeTripPlace({ place_id: 'a' }), place: makePlace({ id: 'a', photos: [] }) },
      {
        ...makeTripPlace({ place_id: 'b' }),
        place: makePlace({ id: 'b', photos: [makePlacePhoto()] }),
      },
    ]
    expect(placeIdsMissingPhotos(rows)).toEqual(['a'])
  })

  it('includes a foreign place whose embed returned null', () => {
    const rows = [{ ...makeTripPlace({ place_id: 'foreign' }), place: null }]
    expect(placeIdsMissingPhotos(rows)).toEqual(['foreign'])
  })
})

describe('mergePublicPhotos', () => {
  it('fills in public photos for a place that had none', () => {
    const rows = [
      { ...makeTripPlace({ place_id: 'a' }), place: makePlace({ id: 'a', photos: [] }) },
    ]
    const photo = makePlacePhoto({ id: 'ph1', place_id: 'a', url: 'pub.jpg' })
    const merged = mergePublicPhotos(rows, new Map([['a', [photo]]]))
    expect(merged[0].place?.photos).toEqual([photo])
  })

  it('leaves a place that already has photos untouched', () => {
    const own = makePlacePhoto({ id: 'own', url: 'own.jpg' })
    const rows = [
      { ...makeTripPlace({ place_id: 'a' }), place: makePlace({ id: 'a', photos: [own] }) },
    ]
    const merged = mergePublicPhotos(rows, new Map([['a', [makePlacePhoto({ id: 'other' })]]]))
    expect(merged[0].place?.photos).toEqual([own])
  })

  it('leaves a null place as null when there are no public photos', () => {
    const rows = [{ ...makeTripPlace({ place_id: 'foreign' }), place: null }]
    expect(mergePublicPhotos(rows, new Map())[0].place).toBeNull()
  })

  it('attaches public photos to a foreign place whose embed was null', () => {
    const rows = [{ ...makeTripPlace({ place_id: 'foreign' }), place: null }]
    const photo = makePlacePhoto({ id: 'pub', place_id: 'foreign', url: 'pub.jpg' })
    const merged = mergePublicPhotos(rows, new Map([['foreign', [photo]]]))
    expect(merged[0].place).toBeNull()
    expect(merged[0].public_photos).toEqual([photo])
  })
})
