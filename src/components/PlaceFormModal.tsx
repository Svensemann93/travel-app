import { useState } from 'react'
import SignedImage from './SignedImage'
import type { PlacePhoto } from '../types/place'
import { validateImageFile, MAX_FILE_SIZE_LABEL } from '../lib/imageResize'

type PlaceData = {
  name: string
  description: string
  rating: number | null
  price_level: number | null
  website_url: string
  photos: File[]
  photosToDelete: string[]
}

type Props = {
  isOpen: boolean
  latitude: number
  longitude: number
  initialData?: Omit<PlaceData, 'photos' | 'photosToDelete'> & {
    existingPhotos?: PlacePhoto[]
  }
  onClose: () => void
  onSave: (data: PlaceData) => Promise<void>
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl leading-none transition-colors"
        >
          <span className={(hovered ?? value ?? 0) >= star ? 'text-yellow-400' : 'text-slate-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

function PriceLevel({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(value === level ? 0 : level)}
          className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
            (value ?? 0) >= level
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-slate-300 text-slate-400 hover:border-slate-400'
          }`}
        >
          {'$'.repeat(level)}
        </button>
      ))}
    </div>
  )
}

function PlaceFormModal({ isOpen, latitude, longitude, initialData, onClose, onSave }: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [rating, setRating] = useState<number | null>(initialData?.rating ?? null)
  const [priceLevel, setPriceLevel] = useState<number | null>(initialData?.price_level ?? null)
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url ?? '')
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<PlacePhoto[]>(
    initialData?.existingPhotos ?? [],
  )
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEditMode = initialData !== undefined

  if (!isOpen) return null

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
      const unique = Array.from(new Set(rejected))
      setErrorMessage(unique.join('\n'))
    } else {
      setErrorMessage('')
    }

    setPhotos((prev) => [...prev, ...accepted])
    e.target.value = ''
  }

  function removeNewPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function removeExistingPhoto(photo: PlacePhoto) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    setPhotosToDelete((prev) => [...prev, photo.id])
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)

    try {
      await onSave({
        name,
        description,
        rating: rating === 0 ? null : rating,
        price_level: priceLevel === 0 ? null : priceLevel,
        website_url: websiteUrl,
        photos,
        photosToDelete,
      })
      onClose()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler')
    } finally {
      setIsSaving(false)
    }
  }

  const hasAnyPhotos = existingPhotos.length > 0 || photos.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {isEditMode ? 'Ort bearbeiten' : 'Neuen Ort hinzufügen'}
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          Position: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="place-name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="place-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="place-description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="place-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-6">
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-1">Bewertung</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-1">Preis</p>
              <PriceLevel value={priceLevel} onChange={setPriceLevel} />
            </div>
          </div>

          <div>
            <label
              htmlFor="place-website"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Website
            </label>
            <input
              id="place-website"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
                      onClick={() => removeExistingPhoto(photo)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {photos.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400"
            >
              {isSaving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlaceFormModal
