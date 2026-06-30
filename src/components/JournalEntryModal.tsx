import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import PhotoUploader from './PhotoUploader'
import SignedImage from './SignedImage'
import type { JournalEntryInput, JournalEntryPhoto } from '../types/journal'
import type { PlacePhoto } from '../types/place'

export type JournalEntrySavePayload = {
  data: JournalEntryInput
  newPhotos: File[]
  photosToDelete: JournalEntryPhoto[]
  photoStartPosition: number
}

type Props = {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialData?: {
    entry_date: string
    title: string
    body: string
    place_id: string | null
    photos: JournalEntryPhoto[]
    place_photos: PlacePhoto[]
    place_photo_ids: string[] | null
  }
  isSaving: boolean
  onClose: () => void
  onSave: (payload: JournalEntrySavePayload) => void
}

function JournalEntryModal({ isOpen, mode, initialData, isSaving, onClose, onSave }: Props) {
  const { t } = useTranslation(['entries', 'common'])
  const formId = useId()
  const [entryDate, setEntryDate] = useState(initialData?.entry_date ?? '')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [body, setBody] = useState(initialData?.body ?? '')
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<JournalEntryPhoto[]>(
    initialData?.photos ?? [],
  )
  const [photosToDelete, setPhotosToDelete] = useState<JournalEntryPhoto[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)

  const placePhotos = initialData?.place_photos ?? []
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(
    () => new Set(initialData?.place_photo_ids ?? placePhotos.map((p) => p.id)),
  )

  const placeId = initialData?.place_id ?? null

  function removeExistingPhoto(photo: JournalEntryPhoto) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    setPhotosToDelete((prev) => [...prev, photo])
  }

  function togglePlacePhoto(id: string) {
    setSelectedPlaceIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const allSelected =
      placePhotos.length > 0 && placePhotos.every((p) => selectedPlaceIds.has(p.id))
    const placePhotoIds =
      placePhotos.length === 0 ? null : allSelected ? null : Array.from(selectedPlaceIds)
    onSave({
      data: {
        entry_date: entryDate || null,
        title: title.trim() || null,
        body: body.trim() || null,
        place_id: placeId,
        place_photo_ids: placePhotoIds,
      },
      newPhotos,
      photosToDelete,
      photoStartPosition: existingPhotos.length,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100"
          >
            {t('common:action.cancel')}
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSaving ? t('common:action.processing') : t('common:action.save')}
          </button>
        </div>
      }
    >
      <h2 className="mb-4 text-xl font-bold text-slate-800">
        {mode === 'edit' ? t('form.editTitle') : t('form.createTitle')}
      </h2>
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="entry-date" className="mb-1 block text-sm font-medium text-slate-700">
            {t('form.date')}
          </label>
          <input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="entry-title" className="mb-1 block text-sm font-medium text-slate-700">
            {t('form.title')}
          </label>
          <input
            id="entry-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="entry-body" className="mb-1 block text-sm font-medium text-slate-700">
            {t('form.body')}
          </label>
          <textarea
            id="entry-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {placePhotos.length > 0 && (
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              {t('form.placePhotos')}
            </span>
            <p className="mb-2 text-xs text-slate-500">{t('form.placePhotosHint')}</p>
            <div className="grid grid-cols-3 gap-2">
              {placePhotos.map((photo) => {
                const isSelected = selectedPlaceIds.has(photo.id)
                return (
                  <button
                    type="button"
                    key={photo.id}
                    onClick={() => togglePlacePhoto(photo.id)}
                    className={`relative overflow-hidden rounded-md ring-2 transition ${
                      isSelected ? 'ring-blue-500' : 'opacity-50 ring-transparent'
                    }`}
                  >
                    <SignedImage
                      path={photo.thumb_url ?? photo.url}
                      alt=""
                      className="h-20 w-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t('form.ownPhotos')}
          </span>
          <PhotoUploader
            newPhotos={newPhotos}
            existingPhotos={existingPhotos}
            onAddNewPhotos={(files) => {
              setPhotoError(null)
              setNewPhotos((prev) => [...prev, ...files])
            }}
            onRemoveNewPhoto={(index) => setNewPhotos((prev) => prev.filter((_, i) => i !== index))}
            onRemoveExistingPhoto={removeExistingPhoto}
            onError={setPhotoError}
          />
          {photoError && (
            <p className="mt-1 whitespace-pre-line text-xs text-red-600">{photoError}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default JournalEntryModal
