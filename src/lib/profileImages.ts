import { supabase } from './supabase'
import { resizeImage } from './imageResize'
import { buildProfileImagePath, type ProfileImageKind } from './profileImagePath'

export type { ProfileImageKind } from './profileImagePath'

const BUCKET = 'profile-images'

const RESIZE = {
  avatar: { maxDimension: 400, quality: 0.8 },
  cover: { maxDimension: 2560, quality: 0.9 },
} as const

export async function uploadProfileImage(
  userId: string,
  kind: ProfileImageKind,
  file: File,
): Promise<string> {
  const blob = await resizeImage(file, RESIZE[kind])
  const path = buildProfileImagePath(userId, kind, crypto.randomUUID())
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/jpeg',
  })
  if (error) throw error
  return path
}

export function profileImageUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deleteProfileImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
