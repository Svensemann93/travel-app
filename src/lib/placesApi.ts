import { supabase } from './supabase'
import { uploadPhoto, deletePhotos as deletePhotoFiles } from './photoStorage'
import type { Place, PlacePhoto } from '../types/place'
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
  return data ?? []
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

export async function deletePlaceRow(id: string): Promise<void> {
  const { error } = await supabase.from('places').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function insertPhotoRows(
  userId: string,
  placeId: string,
  files: File[],
  startPosition: number,
): Promise<PlacePhoto[]> {
  const inserted: PlacePhoto[] = []
  for (let i = 0; i < files.length; i++) {
    const { fullPath, thumbPath } = await uploadPhoto(userId, placeId, files[i])
    const { data, error } = await supabase
      .from('place_photos')
      .insert({
        place_id: placeId,
        user_id: userId,
        url: fullPath,
        thumb_url: thumbPath,
        position: startPosition + i,
      })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    inserted.push(data)
  }
  return inserted
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

export async function removePhotoStorageOnly(photos: PlacePhoto[]): Promise<void> {
  const paths = collectStoragePaths(photos)
  if (paths.length === 0) return
  try {
    await deletePhotoFiles(paths)
  } catch (err) {
    console.error('Storage cleanup failed:', err)
  }
}
