import { describe, expect, it } from 'vitest'
import { availableYears, computeYearReview } from './yearReview'
import type { CategoryId } from './categories'
import type { Place, PlacePhoto, VisitedPlace } from '../types/place'
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

type PlaceOverrides = Partial<Omit<Place, 'visits'>> & {
  created_at: string
  rating?: number | null
  visited_on?: string | null
  planned?: boolean
}

function place({ rating = null, visited_on = null, planned, ...overrides }: PlaceOverrides): Place {
  return {
    id: `place-${Math.random()}`,
    user_id: 'u',
    name: 'Place',
    description: null,
    latitude: 47,
    longitude: 8,
    category: 'other' as CategoryId,
    website_url: null,
    is_public: false,
    country_code: null,
    adopted: false,
    photos: [],
    visits: planned
      ? []
      : [
          {
            id: `visit-${Math.random()}`,
            place_id: 'p',
            user_id: 'u',
            rating,
            price_level: null,
            visited_on,
            created_at: overrides.created_at,
          },
        ],
    ...overrides,
  }
}

function visit(overrides: Partial<VisitedPlace> & { created_at: string }): VisitedPlace {
  return {
    place_id: `visit-${Math.random()}`,
    name: 'Visited place',
    category: 'other' as CategoryId,
    country_code: null,
    rating: null,
    visited_on: null,
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
    cover_photo_path: null,
    cover_focus_x: 50,
    cover_focus_y: 50,
    updated_at: overrides.created_at,
    ...overrides,
  }
}

function journal(created_at: string, tripId: string | null = null): Journal {
  return {
    id: `journal-${Math.random()}`,
    user_id: 'u',
    trip_id: tripId,
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
    const r = computeYearReview(places, [], trips, journals, 2025)
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
    expect(computeYearReview(places, [], trips, journals, 2025).newCountryCount).toBe(1)
    expect(computeYearReview(places, [], trips, journals, 2024).newCountryCount).toBe(1)
  })

  it("aggregates all-time and reports no 'new' countries", () => {
    const r = computeYearReview(places, [], trips, journals, 'all')
    expect(r.placeCount).toBe(3)
    expect(r.countryCount).toBe(2)
    expect(r.photoCount).toBe(3)
    expect(r.tripCount).toBe(2)
    expect(r.newCountryCount).toBe(0)
    expect(r.photos).toHaveLength(3)
  })

  it('returns every photo, one per place before any second photo', () => {
    const many: Place[] = Array.from({ length: 200 }, (_, i) =>
      place({
        created_at: '2025-01-01T00:00:00Z',
        name: `p${i}`,
        photos: [photo('2025-01-01T00:00:00Z'), photo('2025-01-02T00:00:00Z')],
      }),
    )
    const r = computeYearReview(many, [], [], [], 2025)
    expect(r.photos).toHaveLength(400)
    expect(new Set(r.photos.map((p) => p.path)).size).toBe(400)
    expect(new Set(r.photos.slice(0, 200).map((p) => p.placeId)).size).toBe(200)
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
    const r = computeYearReview(few, [], [], [], 2022)
    expect(r.photoCount).toBe(13)
    expect(r.photos).toHaveLength(13)
    expect(r.photos[0].placeId).not.toBe(r.photos[1].placeId)
  })

  it('counts visited public places of other users', () => {
    const visits: VisitedPlace[] = [
      visit({
        created_at: '2026-01-01T00:00:00Z',
        visited_on: '2023-04-01',
        country_code: 'JP',
        category: 'cafe',
        name: 'Foreign cafe',
        rating: 5,
      }),
      visit({
        created_at: '2023-09-09T00:00:00Z',
        country_code: 'JP',
        category: 'cafe',
      }),
      visit({ created_at: '2021-01-01T00:00:00Z', country_code: 'US' }),
    ]
    const r = computeYearReview([], visits, [], [], 2023)
    expect(r.placeCount).toBe(2)
    expect(r.countryCount).toBe(1)
    expect(r.continentCount).toBe(1)
    expect(r.newCountryCount).toBe(1)
    expect(r.topCategory).toEqual({ id: 'cafe', count: 2 })
    expect(r.highlight).toEqual({
      name: 'Foreign cafe',
      countryCode: 'JP',
      rating: 5,
    })
    expect(r.photos).toHaveLength(0)
  })

  it('still counts a visit whose place was deleted or turned private', () => {
    const orphan = visit({
      place_id: null,
      created_at: '2023-04-04T00:00:00Z',
      country_code: 'JP',
      category: 'cafe',
      name: 'Gone but visited',
      rating: 4,
    })
    const r = computeYearReview([], [orphan], [], [], 2023)
    expect(r.placeCount).toBe(1)
    expect(r.countryCount).toBe(1)
    expect(r.highlight).toEqual({
      name: 'Gone but visited',
      countryCode: 'JP',
      rating: 4,
    })
  })

  it('combines own places and visits within the same year', () => {
    const own = [
      place({
        created_at: '2023-05-05T00:00:00Z',
        country_code: 'CH',
        category: 'hiking',
      }),
    ]
    const vis = [
      visit({
        created_at: '2023-06-06T00:00:00Z',
        country_code: 'JP',
        category: 'cafe',
      }),
    ]
    const r = computeYearReview(own, vis, [], [], 2023)
    expect(r.placeCount).toBe(2)
    expect(r.countryCount).toBe(2)
    expect(r.continentCount).toBe(2)
  })

  it('breaks highlight ties by newest date, then by name', () => {
    const tied: Place[] = [
      place({
        created_at: '2024-01-01T00:00:00Z',
        visited_on: '2024-03-01',
        rating: 5,
        name: 'Older',
      }),
      place({
        created_at: '2024-01-01T00:00:00Z',
        visited_on: '2024-09-01',
        rating: 5,
        name: 'Zulu',
      }),
      place({
        created_at: '2024-01-01T00:00:00Z',
        visited_on: '2024-09-01',
        rating: 5,
        name: 'Alpha',
      }),
      place({
        created_at: '2024-01-01T00:00:00Z',
        visited_on: '2024-09-02',
        rating: 4,
        name: 'Lower',
      }),
    ]
    expect(computeYearReview(tied, [], [], [], 2024).highlight?.name).toBe('Alpha')
    const reversed = [...tied].reverse()
    expect(computeYearReview(reversed, [], [], [], 2024).highlight?.name).toBe('Alpha')
  })

  it('carries the place name on every photo', () => {
    const named: Place[] = [
      place({
        created_at: '2024-01-01T00:00:00Z',
        name: 'Kijani Beach Villas',
        photos: [photo('2024-01-01T00:00:00Z')],
      }),
    ]
    const r = computeYearReview(named, [], [], [], 2024)
    expect(r.photos[0].name).toBe('Kijani Beach Villas')
  })

  it('reports trips and journals even without a place in that year', () => {
    const r = computeYearReview(
      [],
      [],
      [trip({ created_at: '2020-02-02T00:00:00Z', start_date: '2020-02-02' })],
      [journal('2020-03-03T00:00:00Z')],
      2020,
    )
    expect(r.placeCount).toBe(0)
    expect(r.tripCount).toBe(1)
    expect(r.journalCount).toBe(1)
  })

  it('dates a journal by the start of the trip it belongs to', () => {
    const tripRow = trip({
      id: 'trip-1',
      created_at: '2026-01-01T00:00:00Z',
      start_date: '2021-07-01',
    })
    const journals2 = [journal('2026-02-02T00:00:00Z', 'trip-1')]
    expect(computeYearReview([], [], [tripRow], journals2, 2026).journalCount).toBe(0)
    expect(computeYearReview([], [], [tripRow], journals2, 2021).journalCount).toBe(1)
  })

  it('falls back to the capture date for journals without a trip', () => {
    const journals2 = [journal('2022-04-04T00:00:00Z')]
    expect(computeYearReview([], [], [], journals2, 2022).journalCount).toBe(1)
  })

  it('falls back to the capture date when the trip has no start date', () => {
    const tripRow = trip({ id: 'trip-2', created_at: '2020-01-01T00:00:00Z' })
    const journals2 = [journal('2023-08-08T00:00:00Z', 'trip-2')]
    expect(computeYearReview([], [], [tripRow], journals2, 2023).journalCount).toBe(1)
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
    expect(computeYearReview(dated, [], [], [], 2026).placeCount).toBe(0)
    const r = computeYearReview(dated, [], [], [], 2019)
    expect(r.placeCount).toBe(1)
    expect(r.countryCount).toBe(1)
    expect(r.newCountryCount).toBe(1)
    expect(r.photoCount).toBe(1)
  })

  it('leaves planned places out of the review', () => {
    const planned: Place[] = [
      place({
        created_at: '2025-04-01T00:00:00Z',
        planned: true,
        country_code: 'JP',
        photos: [photo('2025-04-01T00:00:00Z')],
      }),
      place({
        created_at: '2025-04-02T00:00:00Z',
        country_code: 'JP',
        rating: 4,
      }),
    ]
    const r = computeYearReview(planned, [], [], [], 2025)
    expect(r.placeCount).toBe(1)
    expect(r.photoCount).toBe(0)
    expect(availableYears([planned[0]], [], [], [])).toEqual([new Date().getFullYear()])
  })

  it('returns an empty review for a year without data', () => {
    const r = computeYearReview(places, [], trips, journals, 2019)
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
      [],
    )
    expect(years).toEqual([new Date().getFullYear(), 2018])
  })

  it('includes years of visited public places', () => {
    const years = availableYears(
      [],
      [visit({ created_at: '2026-01-01T00:00:00Z', visited_on: '2017-03-03' })],
      [],
      [],
    )
    expect(years).toEqual([new Date().getFullYear(), 2017])
  })

  it('offers the trip year for a journal that belongs to a trip', () => {
    const years = availableYears(
      [],
      [],
      [
        trip({
          id: 'trip-9',
          created_at: '2026-01-01T00:00:00Z',
          start_date: '2015-06-01',
        }),
      ],
      [journal('2026-05-05T00:00:00Z', 'trip-9')],
    )
    expect(years).toEqual([new Date().getFullYear(), 2015])
  })

  it('returns distinct years plus the current year, newest first', () => {
    const years = availableYears(
      [place({ created_at: '2022-01-01T00:00:00Z' })],
      [],
      [trip({ created_at: '2020-01-01T00:00:00Z', start_date: '2024-01-01' })],
      [journal('2022-06-01T00:00:00Z')],
    )
    const current = new Date().getFullYear()
    expect(years).toEqual([...new Set([current, 2024, 2022])].sort((a, b) => b - a))
  })
})
