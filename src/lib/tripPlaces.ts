import { DEFAULT_CATEGORY } from './categories'
import type { CategoryId } from './categories'
import type { Place } from '../types/place'
import type { TripPlace, TripPlaceWithPlace } from '../types/trip'

export type TripPlaceRow = TripPlace & { place: Place | null }

export function toTripPlace(row: TripPlaceRow): TripPlaceWithPlace {
  const place: Place = row.place ?? {
    id: row.place_id,
    user_id: '',
    name: row.place_name ?? '',
    description: null,
    latitude: row.place_latitude ?? 0,
    longitude: row.place_longitude ?? 0,
    category: (row.place_category ?? DEFAULT_CATEGORY) as CategoryId,
    website_url: null,
    is_public: true,
    country_code: row.place_country_code,
    adopted: false,
    created_at: row.created_at,
    photos: [],
    visits: [],
  }
  return { ...row, place, is_foreign: row.place === null }
}
