import SignedImage from './SignedImage'
import type { PlacePhoto } from '../types/place'
import { validateImageFile, MAX_FILE_SIZE_LABEL } from '../lib/imageResize'

type Props = {
  newPhotos: File[]
  existingPhotos: PlacePhoto[]
  onAddNewPhotos: (files: File[]) => void
  onRemoveNewPhoto: (index: number) => void
  onRemoveExistingPhoto: (photo: PlacePhoto) => void
  onError: (message: string) => void
}

function PhotoUploader({
  newPhotos,
  existingPhotos,
  onAddNewPhotos,
  onRemoveNewPhoto,
  onRemoveExistingPhoto,
  onError,
}: Props) {
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
      <p className="block text-sm font-medium text-slate-700 mb-1">Fotos</p>
      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-md text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
        <span>+ Fotos hinzufügen</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <p className="mt-1 text-xs text-slate-500">
        JPG, PNG, WebP oder HEIC, max. {MAX_FILE_SIZE_LABEL} pro Datei.
      </p>

      {hasAnyPhotos && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="relative group">
              <SignedImage
                path={photo.thumb_url ?? photo.url}
                alt=""
                className="w-full h-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => onRemoveExistingPhoto(photo)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          {newPhotos.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => onRemoveNewPhoto(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
