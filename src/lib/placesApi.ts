import { supabase } from './supabase'
import { deletePhotos as deletePhotoFiles, uploadPhoto } from './photoStorage'
import type { NewPhoto, Place, PlacePhoto, PublicPlace } from '../types/place'
import type { PlaceCreateInput, PlaceUpdateInput } from '../types/place'

type PlaceRow = Omit<Place, 'photos'>

function collectStoragePaths(photos: PlacePhoto[]): string[] {
  return photos.flatMap((p) => (p.thumb_url ? [p.url, p.thumb_url] : [p.url]))
}

export async function fetchPlacesForUser(signal?: AbortSignal): Promise<Place[]> {
  let query = supabase
    .from('places')
    .select('*, photos:place_photos(*)')
    .order('created_at', { ascending: false })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((p: Place) => ({
    ...p,
    rating: p.rating != null ? Number(p.rating) : null,
  }))
}

export async function fetchPublicPlaces(signal?: AbortSignal): Promise<PublicPlace[]> {
  let query = supabase.rpc('get_public_places')
  if (signal) {
    query = query.abortSignal(signal)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: PublicPlace) => ({
    ...row,
    rating: row.rating != null ? Number(row.rating) : null,
    avg_rating: row.avg_rating != null ? Number(row.avg_rating) : null,
    avg_price: row.avg_price != null ? Number(row.avg_price) : null,
    my_rating: row.my_rating != null ? Number(row.my_rating) : null,
  }))
}

export async function upsertPlaceVisit(
  userId: string,
  placeId: string,
  rating: number | null,
  priceLevel: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('place_visits')
    .upsert(
      { place_id: placeId, user_id: userId, rating, price_level: priceLevel },
      { onConflict: 'place_id,user_id' },
    )
  if (error) throw new Error(error.message)
}

export async function deletePlaceVisit(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('place_visits')
    .delete()
    .eq('place_id', placeId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function insertPlaceRow(userId: string, data: PlaceCreateInput): Promise<PlaceRow> {
  const { data: row, error } = await supabase
    .from('places')
    .insert({ ...data, user_id: userId })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function updatePlaceRow(id: string, data: PlaceUpdateInput): Promise<PlaceRow> {
  const { data: row, error } = await supabase
    .from('places')
    .update(data)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function updatePlaceLocation(
  id: string,
  latitude: number,
  longitude: number,
): Promise<PlaceRow> {
  const { data: row, error } = await supabase
    .from('places')
    .update({ latitude, longitude })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function deletePlaceRow(id: string): Promise<void> {
  const { error } = await supabase.from('places').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function insertPhotoRows(
  userId: string,
  placeId: string,
  photos: NewPhoto[],
  startPosition: number,
): Promise<PlacePhoto[]> {
  if (photos.length === 0) return []

  return Promise.all(
    photos.map(async (photo, i) => {
      const { fullPath, thumbPath } = await uploadPhoto(userId, placeId, photo.file)
      const { data, error } = await supabase
        .from('place_photos')
        .insert({
          place_id: placeId,
          user_id: userId,
          url: fullPath,
          thumb_url: thumbPath,
          position: startPosition + i,
          is_public: photo.isPublic,
        })
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return data
    }),
  )
}

export async function removePhotos(photos: PlacePhoto[]): Promise<void> {
  if (photos.length === 0) return
  await removePhotoStorageOnly(photos)
  const { error } = await supabase
    .from('place_photos')
    .delete()
    .in(
      'id',
      photos.map((p) => p.id),
    )
  if (error) throw new Error(error.message)
}

export async function updatePhotoVisibility(changes: Record<string, boolean>): Promise<void> {
  const entries = Object.entries(changes ?? {})
  if (entries.length === 0) return
  await Promise.all(
    entries.map(async ([id, isPublic]) => {
      const { error } = await supabase
        .from('place_photos')
        .update({ is_public: isPublic })
        .eq('id', id)
      if (error) throw new Error(error.message)
    }),
  )
}

export async function removePhotoStorageOnly(photos: PlacePhoto[]): Promise<void> {
  const paths = collectStoragePaths(photos)
  if (paths.length === 0) return
  try {
    await deletePhotoFiles(paths)
  } catch (err) {
    console.error('Storage cleanup failed:', err)
  }
}
