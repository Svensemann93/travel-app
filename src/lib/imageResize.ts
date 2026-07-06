import i18n from './i18n'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_FILE_SIZE_LABEL = '10 MB'

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return i18n.t('common:upload.invalidType')
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return i18n.t('common:upload.tooLarge', { size: MAX_FILE_SIZE_LABEL })
  }
  return null
}

type ResizeOptions = {
  maxDimension: number
  quality: number
}

export async function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

  let { width, height } = bitmap

  if (width > options.maxDimension || height > options.maxDimension) {
    const ratio = Math.min(options.maxDimension / width, options.maxDimension / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas context unavailable')
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Image processing failed'))
      },
      'image/jpeg',
      options.quality,
    )
  })
}
