import { useState } from 'react'
import Modal from './Modal'
import PhotoUploader from './PhotoUploader'
import PriceLevel from './PriceLevel'
import StarRating from './StarRating'
import type { PlacePhoto } from '../types/place'

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
          <label htmlFor="place-website" className="block text-sm font-medium text-slate-700 mb-1">
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

        <PhotoUploader
          newPhotos={photos}
          existingPhotos={existingPhotos}
          onAddNewPhotos={(files) => setPhotos((prev) => [...prev, ...files])}
          onRemoveNewPhoto={(index) => setPhotos((prev) => prev.filter((_, i) => i !== index))}
          onRemoveExistingPhoto={(photo) => {
            setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
            setPhotosToDelete((prev) => [...prev, photo.id])
          }}
          onError={setErrorMessage}
        />

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
    </Modal>
  )
}

export default PlaceFormModal
