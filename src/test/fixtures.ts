import type { Place } from '../types/place'
import type { Trip, TripPlace, TripPlaceWithPlace, TripWithPlaces } from '../types/trip'

export function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'place-1',
    user_id: 'test-user-id',
    name: 'Test Place',
    description: null,
    latitude: 47.3769,
    longitude: 8.5417,
    rating: null,
    price_level: null,
    website_url: null,
    created_at: '2025-01-15T00:00:00.000Z',
    photos: [],
    ...overrides,
  }
}

export function makeTripPlace(overrides: Partial<TripPlace> = {}): TripPlace {
  return {
    trip_id: 'trip-1',
    place_id: 'place-1',
    position: 0,
    planned_date: null,
    notes: null,
    created_at: '2025-01-15T00:00:00.000Z',
    ...overrides,
  }
}

export function makeTripPlaceWithPlace(
  overrides: Partial<TripPlaceWithPlace> = {},
): TripPlaceWithPlace {
  return {
    trip_id: 'trip-1',
    place_id: 'place-1',
    position: 0,
    planned_date: null,
    notes: null,
    created_at: '2025-01-15T00:00:00.000Z',
    place: makePlace(),
    ...overrides,
  }
}

export function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    user_id: 'test-user-id',
    name: 'Test Trip',
    description: null,
    start_date: null,
    end_date: null,
    created_at: '2025-01-15T00:00:00.000Z',
    updated_at: '2025-01-15T00:00:00.000Z',
    ...overrides,
  }
}

export function makeTripWithPlaces(overrides: Partial<TripWithPlaces> = {}): TripWithPlaces {
  return {
    ...makeTrip(),
    trip_places: [],
    ...overrides,
  }
}
