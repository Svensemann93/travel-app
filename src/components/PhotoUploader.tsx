import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { validateImageFile, MAX_FILE_SIZE_LABEL } from '../lib/imageResize'

type UploaderPhoto = { id: string; url: string; thumb_url: string | null }

type Props<T extends UploaderPhoto> = {
  newPhotos: File[]
  existingPhotos: T[]
  onAddNewPhotos: (files: File[]) => void
  onRemoveNewPhoto: (index: number) => void
  onRemoveExistingPhoto: (photo: T) => void
  onError: (message: string) => void
}

function PhotoUploader<T extends UploaderPhoto>({
  newPhotos,
  existingPhotos,
  onAddNewPhotos,
  onRemoveNewPhoto,
  onRemoveExistingPhoto,
  onError,
}: Props<T>) {
  const { t } = useTranslation()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const accepted: File[] = []
    const rejected: string[] = []

    for (const file of files) {
      const error = validateImageFile(file)
      if (error) {
        rejected.push(error)
      } else {
        accepted.push(file)
      }
    }

    if (rejected.length > 0) {
      onError(Array.from(new Set(rejected)).join('\n'))
    }

    onAddNewPhotos(accepted)
    e.target.value = ''
  }

  const hasAnyPhotos = existingPhotos.length > 0 || newPhotos.length > 0

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-500">
        <span>{t('photo.add')}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <p className="mt-1 text-xs text-slate-500">
        {t('photo.constraints', { size: MAX_FILE_SIZE_LABEL })}
      </p>

      {hasAnyPhotos && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="group relative">
              <SignedImage
                path={photo.thumb_url ?? photo.url}
                alt={t('photo.remove')}
                className="h-20 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveExistingPhoto(photo)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t('photo.remove')}
              >
                ✕
              </button>
            </div>
          ))}
          {newPhotos.map((file, index) => (
            <div key={index} className="group relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveNewPhoto(index)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t('photo.remove')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotoUploader
