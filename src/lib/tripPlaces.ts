import { DEFAULT_CATEGORY } from './categories'
import type { CategoryId } from './categories'
import type { Place, PlacePhoto } from '../types/place'
import type { TripPlace, TripPlaceWithPlace } from '../types/trip'

export type TripPlaceRow = TripPlace & { place: Place | null; public_photos?: PlacePhoto[] }

export function placeIdsMissingPhotos(rows: TripPlaceRow[]): string[] {
  return rows.filter((row) => (row.place?.photos?.length ?? 0) === 0).map((row) => row.place_id)
}

export function mergePublicPhotos(
  rows: TripPlaceRow[],
  publicPhotos: Map<string, PlacePhoto[]>,
): TripPlaceRow[] {
  return rows.map((row) => {
    if (row.place && (row.place.photos?.length ?? 0) > 0) return row
    const photos = publicPhotos.get(row.place_id)
    if (!photos || photos.length === 0) return row
    if (row.place) return { ...row, place: { ...row.place, photos } }
    return { ...row, public_photos: photos }
  })
}

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
    photos: row.public_photos ?? [],
    visits: [],
  }
  return { ...row, place, is_foreign: row.place === null }
}
