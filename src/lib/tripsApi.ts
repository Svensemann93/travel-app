import { supabase } from './supabase'
import type {
  Trip,
  TripInput,
  TripPlace,
  TripPlaceUpdateInput,
  TripWithPlaces,
} from '../types/trip'

export async function fetchTripsForUser(signal?: AbortSignal): Promise<Trip[]> {
  let query = supabase.from('trips').select('*').order('created_at', { ascending: false })
  if (signal) {
    query = query.abortSignal(signal)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
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
  return data
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
