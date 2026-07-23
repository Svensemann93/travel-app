import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import StarRating from './StarRating'
import PriceLevel from './PriceLevel'
import PhotoUploader from './PhotoUploader'
import { useMyPlacePhotos, useSaveMyPlacePhotos } from '../hooks/useMyPlacePhotos'
import type { PlacePhoto, PublicPlace } from '../types/place'

type Props = {
  place: PublicPlace
  onClose: () => void
  onSave: (
    placeId: string,
    rating: number | null,
    priceLevel: number | null,
    visitedOn: string | null,
  ) => void
  onRemove: (placeId: string) => void
  isSaving: boolean
}

function VisitEditModal({ place, onClose, onSave, onRemove, isSaving }: Props) {
  const { t } = useTranslation(['map', 'common'])
  const [rating, setRating] = useState<number | null>(place.my_rating)
  const [price, setPrice] = useState<number | null>(place.my_price)
  const [visitedOn, setVisitedOn] = useState(place.my_visited_on ?? '')

  const { data: myPhotos = [] } = useMyPlacePhotos(place.id)
  const savePhotos = useSaveMyPlacePhotos()
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPhotoPublic, setNewPhotoPublic] = useState<boolean[]>([])
  const [removedPhotos, setRemovedPhotos] = useState<PlacePhoto[]>([])
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const [photoError, setPhotoError] = useState('')

  const removedIds = new Set(removedPhotos.map((photo) => photo.id))
  const visiblePhotos = myPhotos
    .filter((photo) => !removedIds.has(photo.id))
    .map((photo) => ({ ...photo, is_public: visibility[photo.id] ?? photo.is_public }))

  function toggleExisting(photo: PlacePhoto) {
    setVisibility((current) => ({
      ...current,
      [photo.id]: !(current[photo.id] ?? photo.is_public),
    }))
  }

  async function handleSave() {
    setPhotoError('')
    const hasPhotoChanges =
      newPhotos.length > 0 || removedPhotos.length > 0 || Object.keys(visibility).length > 0
    if (hasPhotoChanges) {
      try {
        await savePhotos.mutateAsync({
          placeId: place.id,
          added: newPhotos.map((file, index) => ({
            file,
            isPublic: newPhotoPublic[index] ?? false,
          })),
          removed: removedPhotos,
          visibility,
          startPosition: myPhotos.length,
        })
      } catch {
        setPhotoError(t('visits.photoError'))
        return
      }
    }
    onSave(place.id, rating || null, price || null, visitedOn || null)
  }

  const busy = isSaving || savePhotos.isPending

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
      >
        {t('common:action.cancel')}
      </button>
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={busy}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('common:action.save')}
      </button>
    </div>
  )

  return (
    <Modal isOpen onClose={onClose} maxWidth="sm" footer={footer}>
      <h2 className="text-xl font-bold text-slate-800">{t('visits.editTitle')}</h2>
      <p className="mt-1 text-sm text-slate-500">{place.name}</p>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{t('visits.yourRatingLabel')}</p>
            {rating ? (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
              >
                {t('visits.clear')}
              </button>
            ) : null}
          </div>
          <StarRating value={rating} onChange={(r) => setRating(r || null)} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{t('visits.yourPriceLabel')}</p>
            {price ? (
              <button
                type="button"
                onClick={() => setPrice(null)}
                className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
              >
                {t('visits.clear')}
              </button>
            ) : null}
          </div>
          <PriceLevel value={price} onChange={(p) => setPrice(p || null)} />
        </div>

        <div>
          <label
            htmlFor="visit-visited-on"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {t('visits.visitedOnLabel')}
          </label>
          <input
            id="visit-visited-on"
            type="date"
            value={visitedOn}
            onChange={(e) => setVisitedOn(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">{t('visits.yourPhotosLabel')}</p>
          <PhotoUploader
            newPhotos={newPhotos}
            existingPhotos={visiblePhotos}
            onAddNewPhotos={(files) => {
              setNewPhotos((current) => [...current, ...files])
              setNewPhotoPublic((current) => [...current, ...files.map(() => false)])
            }}
            onRemoveNewPhoto={(index) => {
              setNewPhotos((current) => current.filter((_, i) => i !== index))
              setNewPhotoPublic((current) => current.filter((_, i) => i !== index))
            }}
            onRemoveExistingPhoto={(photo) => setRemovedPhotos((current) => [...current, photo])}
            onError={setPhotoError}
            isPlacePublic
            newPhotoPublic={newPhotoPublic}
            onToggleNewPhoto={(index) =>
              setNewPhotoPublic((current) =>
                current.map((value, i) => (i === index ? !value : value)),
              )
            }
            onTogglePhotoVisibility={toggleExisting}
          />
          {photoError ? (
            <p className="mt-1 whitespace-pre-line text-xs text-red-600">{photoError}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onRemove(place.id)}
          disabled={busy}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {t('visits.remove')}
        </button>
      </div>
    </Modal>
  )
}

export default VisitEditModal
