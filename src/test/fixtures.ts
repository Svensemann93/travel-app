import type { Place, PlacePhoto, PlaceVisit, PublicPlace } from '../types/place'
import type { Trip, TripPlace, TripPlaceWithPlace, TripWithPlaces } from '../types/trip'
import type {
  Journal,
  JournalEntry,
  JournalEntryPhoto,
  JournalEntryWithPlace,
  JournalWithEntries,
} from '../types/journal'

export function makePublicPlace(overrides: Partial<PublicPlace> = {}): PublicPlace {
  return {
    id: 'public-1',
    name: 'Bockmattlipass',
    description: null,
    latitude: 47.05,
    longitude: 8.95,
    category: 'other',
    website_url: null,
    username: 'testuser',
    country_code: 'CH',
    photos: [],
    avg_rating: null,
    avg_price: null,
    visit_count: 0,
    my_rating: null,
    my_price: null,
    my_visited_on: null,
    visited_by_me: false,
    wished_by_me: true,
    wished_on: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makePlaceVisit(overrides: Partial<PlaceVisit> = {}): PlaceVisit {
  return {
    id: 'visit-1',
    place_id: 'place-1',
    user_id: 'test-user-id',
    place_name: null,
    place_category: null,
    place_country_code: null,
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
    place_name: 'Test Place',
    place_latitude: 47.3769,
    place_longitude: 8.5417,
    place_category: 'other',
    place_country_code: null,
    ...overrides,
  }
}
export function makeTripPlaceWithPlace(
  overrides: Partial<TripPlaceWithPlace> = {},
): TripPlaceWithPlace {
  return {
    ...makeTripPlace(),
    place: makePlace(),
    is_foreign: false,
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
    cover_photo_path: null,
    cover_focus_x: 50,
    cover_focus_y: 50,
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
    cover_photo_path: null,
    cover_focus_x: 50,
    cover_focus_y: 50,
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
