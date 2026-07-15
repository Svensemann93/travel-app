import { describe, expect, it } from 'vitest'
import { availableYears, computeYearReview } from './yearReview'
import type { CategoryId } from './categories'
import type { Place, PlacePhoto } from '../types/place'
import type { Trip } from '../types/trip'
import type { Journal } from '../types/journal'

function photo(created_at: string): PlacePhoto {
  const id = `photo-${created_at}-${Math.random()}`
  return {
    id,
    place_id: 'p',
    user_id: 'u',
    url: `${id}.jpg`,
    thumb_url: null,
    position: 0,
    is_public: false,
    created_at,
  }
}

function place(overrides: Partial<Place> & { created_at: string }): Place {
  return {
    id: `place-${Math.random()}`,
    user_id: 'u',
    name: 'Place',
    description: null,
    latitude: 47,
    longitude: 8,
    category: 'other' as CategoryId,
    rating: null,
    price_level: null,
    website_url: null,
    is_public: false,
    country_code: null,
    visited_on: null,
    photos: [],
    ...overrides,
  }
}

function trip(overrides: Partial<Trip> & { created_at: string }): Trip {
  return {
    id: `trip-${Math.random()}`,
    user_id: 'u',
    name: 'Trip',
    description: null,
    start_date: null,
    end_date: null,
    updated_at: overrides.created_at,
    ...overrides,
  }
}

function journal(created_at: string): Journal {
  return {
    id: `journal-${Math.random()}`,
    user_id: 'u',
    trip_id: null,
    title: 'J',
    description: null,
    created_at,
    updated_at: created_at,
  }
}

describe('computeYearReview', () => {
  const places: Place[] = [
    place({
      created_at: '2024-08-01T00:00:00Z',
      category: 'cafe',
      country_code: 'IT',
      rating: 4,
      photos: [photo('2024-08-02T00:00:00Z')],
    }),
    place({
      created_at: '2025-03-10T00:00:00Z',
      category: 'cafe',
      country_code: 'IT',
      rating: 5,
      name: 'Cinque Terre',
      photos: [photo('2025-03-11T00:00:00Z'), photo('2024-12-01T00:00:00Z')],
    }),
    place({
      created_at: '2025-06-20T00:00:00Z',
      category: 'hiking',
      country_code: 'FR',
      rating: 3,
    }),
  ]
  const trips: Trip[] = [
    trip({ created_at: '2025-01-01T00:00:00Z', start_date: '2025-06-01' }),
    trip({ created_at: '2024-01-01T00:00:00Z' }),
  ]
  const journals: Journal[] = [journal('2025-05-05T00:00:00Z'), journal('2023-05-05T00:00:00Z')]

  it('aggregates a single year and counts photos of its places', () => {
    const r = computeYearReview(places, trips, journals, 2025)
    expect(r.placeCount).toBe(2)
    expect(r.countryCount).toBe(2)
    expect(r.continentCount).toBe(1)
    expect(r.tripCount).toBe(1)
    expect(r.journalCount).toBe(1)
    expect(r.photoCount).toBe(2)
    expect(r.topCategory).toEqual({ id: 'cafe', count: 1 })
    expect(r.highlight).toEqual({
      name: 'Cinque Terre',
      countryCode: 'IT',
      rating: 5,
    })
    expect(r.photos).toHaveLength(2)
  })

  it('counts only countries first reached in the selected year as new', () => {
    expect(computeYearReview(places, trips, journals, 2025).newCountryCount).toBe(1)
    expect(computeYearReview(places, trips, journals, 2024).newCountryCount).toBe(1)
  })

  it("aggregates all-time and reports no 'new' countries", () => {
    const r = computeYearReview(places, trips, journals, 'all')
    expect(r.placeCount).toBe(3)
    expect(r.countryCount).toBe(2)
    expect(r.photoCount).toBe(3)
    expect(r.tripCount).toBe(2)
    expect(r.newCountryCount).toBe(0)
    expect(r.photos).toHaveLength(3)
  })

  it('spreads photos across the whole place list', () => {
    const many: Place[] = Array.from({ length: 200 }, (_, i) =>
      place({
        created_at: '2025-01-01T00:00:00Z',
        name: `p${i}`,
        photos: [photo('2025-01-01T00:00:00Z'), photo('2025-01-02T00:00:00Z')],
      }),
    )
    const r = computeYearReview(many, [], [], 2025)
    expect(r.photos).toHaveLength(48)
    expect(new Set(r.photos.map((p) => p.path)).size).toBe(48)
    expect(new Set(r.photos.map((p) => p.placeId)).size).toBeGreaterThanOrEqual(40)
  })

  it('uses several photos per place when the year has few places', () => {
    const few: Place[] = [
      place({
        created_at: '2022-01-01T00:00:00Z',
        photos: Array.from({ length: 8 }, () => photo('2022-01-01T00:00:00Z')),
      }),
      place({
        created_at: '2022-02-01T00:00:00Z',
        photos: Array.from({ length: 5 }, () => photo('2022-02-01T00:00:00Z')),
      }),
    ]
    const r = computeYearReview(few, [], [], 2022)
    expect(r.photoCount).toBe(13)
    expect(r.photos).toHaveLength(13)
    expect(r.photos[0].placeId).not.toBe(r.photos[1].placeId)
  })

  it('prefers the travel date over the capture date', () => {
    const dated: Place[] = [
      place({
        created_at: '2026-01-05T00:00:00Z',
        visited_on: '2019-08-14',
        country_code: 'ES',
        rating: 4,
        photos: [photo('2026-01-05T00:00:00Z')],
      }),
    ]
    expect(computeYearReview(dated, [], [], 2026).placeCount).toBe(0)
    const r = computeYearReview(dated, [], [], 2019)
    expect(r.placeCount).toBe(1)
    expect(r.countryCount).toBe(1)
    expect(r.newCountryCount).toBe(1)
    expect(r.photoCount).toBe(1)
  })

  it('returns an empty review for a year without data', () => {
    const r = computeYearReview(places, trips, journals, 2019)
    expect(r.placeCount).toBe(0)
    expect(r.topCategory).toBeNull()
    expect(r.highlight).toBeNull()
  })
})

describe('availableYears', () => {
  it('uses the travel date when present', () => {
    const years = availableYears(
      [place({ created_at: '2026-01-01T00:00:00Z', visited_on: '2018-05-02' })],
      [],
      [],
    )
    expect(years).toEqual([new Date().getFullYear(), 2018])
  })

  it('returns distinct years plus the current year, newest first', () => {
    const years = availableYears(
      [place({ created_at: '2022-01-01T00:00:00Z' })],
      [trip({ created_at: '2020-01-01T00:00:00Z', start_date: '2024-01-01' })],
      [journal('2022-06-01T00:00:00Z')],
    )
    const current = new Date().getFullYear()
    expect(years).toEqual([...new Set([current, 2024, 2022])].sort((a, b) => b - a))
  })
})
