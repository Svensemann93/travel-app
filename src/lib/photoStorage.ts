import { supabase } from './supabase'
import { resizeImage } from './imageResize'

const BUCKET = 'place-photos'

export type UploadedPhoto = {
  fullPath: string
  thumbPath: string
}

export async function uploadPhoto(
  userId: string,
  placeId: string,
  file: File,
): Promise<UploadedPhoto> {
  const id = crypto.randomUUID()
  const baseDir = `${userId}/${placeId}`
  const fullPath = `${baseDir}/${id}_full.jpg`
  const thumbPath = `${baseDir}/${id}_thumb.jpg`

  const [fullBlob, thumbBlob] = await Promise.all([
    resizeImage(file, { maxDimension: 1920, quality: 0.85 }),
    resizeImage(file, { maxDimension: 400, quality: 0.7 }),
  ])

  const [fullUpload, thumbUpload] = await Promise.all([
    supabase.storage.from(BUCKET).upload(fullPath, fullBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    }),
    supabase.storage.from(BUCKET).upload(thumbPath, thumbBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    }),
  ])

  if (fullUpload.error || thumbUpload.error) {
    const orphans: string[] = []
    if (!fullUpload.error) orphans.push(fullPath)
    if (!thumbUpload.error) orphans.push(thumbPath)
    if (orphans.length > 0) {
      try {
        await supabase.storage.from(BUCKET).remove(orphans)
      } catch {
        // best-effort cleanup, ignore failures
      }
    }
    throw fullUpload.error ?? thumbUpload.error
  }

  return { fullPath, thumbPath }
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export async function deletePhotos(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
}
