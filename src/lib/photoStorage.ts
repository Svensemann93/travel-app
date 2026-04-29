import { supabase } from './supabase'

const BUCKET = 'place-photos'

export async function uploadPhoto(userId: string, placeId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${placeId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return path
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60) // 1 Stunde gültig

  if (error) throw error
  return data.signedUrl
}

export async function deletePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
