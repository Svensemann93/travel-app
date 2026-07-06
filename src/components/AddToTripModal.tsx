import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import TripFormModal from './TripFormModal'
import { useAddPlaceToTrip, useCreateTrip, useTrips } from '../hooks/useTrips'
import type { Place } from '../types/place'
import type { TripInput } from '../types/trip'

type Props = {
  place: Place | null
  onClose: () => void
}

function AddToTripModal({ place, onClose }: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const { data: trips = [], isLoading } = useTrips()
  const addPlaceToTrip = useAddPlaceToTrip()
  const createTrip = useCreateTrip()
  const [isCreatingTripOpen, setIsCreatingTripOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSelectTrip(tripId: string) {
    if (!place) return
    setErrorMessage('')
    try {
      await addPlaceToTrip.mutateAsync({ tripId, placeId: place.id })
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('form.unknownError'))
    }
  }

  async function handleCreateTripWithPlace(data: TripInput) {
    if (!place) return
    const newTrip = await createTrip.mutateAsync(data)
    await addPlaceToTrip.mutateAsync({ tripId: newTrip.id, placeId: place.id })
    setIsCreatingTripOpen(false)
    onClose()
  }

  return (
    <>
      <Modal isOpen={place !== null} onClose={onClose}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {t('addToTrip.title', { name: place?.name ?? '' })}
        </h2>

        {isLoading && <p className="text-slate-500 text-sm">{t('addToTrip.loading')}</p>}

        {!isLoading && trips.length === 0 && (
          <p className="text-slate-500 text-sm mb-4">{t('addToTrip.empty')}</p>
        )}

        {!isLoading && trips.length > 0 && (
          <ul className="space-y-2 mb-4">
            {trips.map((trip) => (
              <li key={trip.id}>
                <button
                  onClick={() => handleSelectTrip(trip.id)}
                  disabled={addPlaceToTrip.isPending}
                  className="w-full text-left px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-slate-800">{trip.name}</div>
                  {trip.description && (
                    <div className="text-sm text-slate-500 line-clamp-1">{trip.description}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setIsCreatingTripOpen(true)}
          className="text-sm text-blue-600 hover:underline self-start mb-4"
        >
          {t('addToTrip.create')}
        </button>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {t('common:action.close')}
          </button>
        </div>
      </Modal>

      <TripFormModal
        isOpen={isCreatingTripOpen}
        onClose={() => setIsCreatingTripOpen(false)}
        onSave={handleCreateTripWithPlace}
      />
    </>
  )
}

export default AddToTripModal
