import { supabase } from './supabase'
import { mergePublicPhotos, placeIdsMissingPhotos, toTripPlace } from './tripPlaces'
import type { TripPlaceRow } from './tripPlaces'
import type { PlacePhoto } from '../types/place'
import type {
  Trip,
  TripInput,
  TripListItem,
  TripPlace,
  TripPlaceUpdateInput,
  TripWithPlaces,
} from '../types/trip'

export async function fetchTripsForUser(signal?: AbortSignal): Promise<TripListItem[]> {
  let query = supabase
    .from('trips')
    .select(
      '*, place_count:trip_places(count), first_stop:trip_places(place_latitude, place_longitude, position)',
    )
    .order('created_at', { ascending: false })
  if (signal) {
    query = query.abortSignal(signal)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => {
    const { place_count, first_stop, ...trip } = row as Trip & {
      place_count: { count: number }[]
      first_stop: {
        place_latitude: number | null
        place_longitude: number | null
        position: number
      }[]
    }
    const ordered = [...first_stop].sort((a, b) => a.position - b.position)
    const head = ordered[0]
    const firstStop =
      head && head.place_latitude != null && head.place_longitude != null
        ? { latitude: head.place_latitude, longitude: head.place_longitude }
        : null
    return { ...trip, place_count: place_count[0]?.count ?? 0, first_stop: firstStop }
  })
}

export async function fetchTripWithPlaces(
  tripId: string,
  signal?: AbortSignal,
): Promise<TripWithPlaces | null> {
  let query = supabase
    .from('trips')
    .select('*, trip_places(*, place:places(*, photos:place_photos(*)))')
    .eq('id', tripId)
    .order('position', { referencedTable: 'trip_places', ascending: true })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null

  const rows = data.trip_places as TripPlaceRow[]
  const publicPhotos = await fetchPublicPlacePhotos(placeIdsMissingPhotos(rows), signal)
  const merged = mergePublicPhotos(rows, publicPhotos)

  return { ...data, trip_places: merged.map(toTripPlace) }
}

export async function insertTripRow(userId: string, data: TripInput): Promise<Trip> {
  const { data: row, error } = await supabase
    .from('trips')
    .insert({ ...data, user_id: userId })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function updateTripRow(id: string, data: TripInput): Promise<Trip> {
  const { data: row, error } = await supabase
    .from('trips')
    .update(data)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function updateTripCover(
  id: string,
  coverPhotoPath: string | null,
  focusX: number,
  focusY: number,
): Promise<Trip> {
  const { data: row, error } = await supabase
    .from('trips')
    .update({
      cover_photo_path: coverPhotoPath,
      cover_focus_x: focusX,
      cover_focus_y: focusY,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function deleteTripRow(id: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function insertTripPlaceRow(
  tripId: string,
  placeId: string,
  position: number,
): Promise<TripPlace> {
  const { data, error } = await supabase
    .from('trip_places')
    .insert({ trip_id: tripId, place_id: placeId, position })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteTripPlaceRow(tripId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_places')
    .delete()
    .eq('trip_id', tripId)
    .eq('place_id', placeId)
  if (error) throw new Error(error.message)
}

export async function updateTripPlacePositions(
  tripId: string,
  orderedPlaceIds: string[],
): Promise<void> {
  const updates = orderedPlaceIds.map((placeId, index) => ({
    trip_id: tripId,
    place_id: placeId,
    position: index,
  }))
  const { error } = await supabase
    .from('trip_places')
    .upsert(updates, { onConflict: 'trip_id,place_id' })
  if (error) throw new Error(error.message)
}

export async function moveTripPlace(
  tripId: string,
  placeId: string,
  plannedDate: string | null,
  notes: string | null,
  orderedPlaceIds: string[],
): Promise<void> {
  const { error } = await supabase.rpc('move_trip_place', {
    p_trip_id: tripId,
    p_place_id: placeId,
    p_planned_date: plannedDate,
    p_notes: notes,
    p_ordered_place_ids: orderedPlaceIds,
  })
  if (error) throw new Error(error.message)
}

export async function updateTripPlaceRow(
  tripId: string,
  placeId: string,
  data: TripPlaceUpdateInput,
): Promise<TripPlace> {
  const { data: row, error } = await supabase
    .from('trip_places')
    .update(data)
    .eq('trip_id', tripId)
    .eq('place_id', placeId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function fetchPublicPlacePhotos(
  placeIds: string[],
  signal?: AbortSignal,
): Promise<Map<string, PlacePhoto[]>> {
  const byPlace = new Map<string, PlacePhoto[]>()
  if (placeIds.length === 0) return byPlace

  let query = supabase.rpc('get_public_place_photos', { place_ids: placeIds })
  if (signal) {
    query = query.abortSignal(signal)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)

  for (const row of (data ?? []) as PlacePhoto[]) {
    const existing = byPlace.get(row.place_id)
    if (existing) existing.push(row)
    else byPlace.set(row.place_id, [row])
  }
  return byPlace
}
