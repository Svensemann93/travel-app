import type { Place, PlacePhoto, PlaceVisit } from '../types/place'
import type { Trip, TripPlace, TripPlaceWithPlace, TripWithPlaces } from '../types/trip'
import type {
  Journal,
  JournalEntry,
  JournalEntryPhoto,
  JournalEntryWithPlace,
  JournalWithEntries,
} from '../types/journal'

export function makePlaceVisit(overrides: Partial<PlaceVisit> = {}): PlaceVisit {
  return {
    id: 'visit-1',
    place_id: 'place-1',
    user_id: 'test-user-id',
    rating: null,
    price_level: null,
    visited_on: null,
    created_at: '2025-01-15T00:00:00.000Z',
    ...overrides,
  }
}

export function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'place-1',
    user_id: 'test-user-id',
    name: 'Test Place',
    description: null,
    latitude: 47.3769,
    longitude: 8.5417,
    category: 'other',
    website_url: null,
    is_public: false,
    country_code: null,
    adopted: false,
    created_at: '2025-01-15T00:00:00.000Z',
    photos: [],
    visits: [makePlaceVisit()],
    ...overrides,
  }
}

export function makePlacePhoto(overrides: Partial<PlacePhoto> = {}): PlacePhoto {
  return {
    id: 'place-photo-1',
    place_id: 'place-1',
    user_id: 'test-user-id',
    url: 'test-user-id/place-1/full.jpg',
    thumb_url: 'test-user-id/place-1/thumb.jpg',
    position: 0,
    is_public: false,
    created_at: '2025-01-15T00:00:00.000Z',
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

export function makeJournal(overrides: Partial<Journal> = {}): Journal {
  return {
    id: 'journal-1',
    user_id: 'test-user-id',
    trip_id: null,
    title: 'Test Journal',
    description: null,
    created_at: '2025-01-15T00:00:00.000Z',
    updated_at: '2025-01-15T00:00:00.000Z',
    ...overrides,
  }
}

export function makeJournalEntryPhoto(
  overrides: Partial<JournalEntryPhoto> = {},
): JournalEntryPhoto {
  return {
    id: 'entry-photo-1',
    entry_id: 'entry-1',
    user_id: 'test-user-id',
    url: 'test-user-id/entry-1/full.jpg',
    thumb_url: 'test-user-id/entry-1/thumb.jpg',
    position: 0,
    created_at: '2025-01-15T00:00:00.000Z',
    ...overrides,
  }
}

export function makeJournalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'entry-1',
    journal_id: 'journal-1',
    place_id: null,
    entry_date: null,
    title: null,
    body: null,
    position: 0,
    place_photo_ids: null,
    created_at: '2025-01-15T00:00:00.000Z',
    photos: [],
    ...overrides,
  }
}

export function makeJournalEntryWithPlace(
  overrides: Partial<JournalEntryWithPlace> = {},
): JournalEntryWithPlace {
  return {
    ...makeJournalEntry(),
    place: null,
    ...overrides,
  }
}

export function makeJournalWithEntries(
  overrides: Partial<JournalWithEntries> = {},
): JournalWithEntries {
  return {
    ...makeJournal(),
    journal_entries: [],
    ...overrides,
  }
}
