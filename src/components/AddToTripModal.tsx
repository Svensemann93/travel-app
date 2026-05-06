import { useState } from 'react'
import type { Place } from '../types/place'
import { useAddPlaceToTrip, useCreateTrip, useTrips } from '../hooks/useTrips'
import type { TripInput } from '../types/trip'
import TripFormModal from './TripFormModal'

type Props = {
  place: Place | null
  onClose: () => void
}

function AddToTripModal({ place, onClose }: Props) {
  const { data: trips = [], isLoading } = useTrips()
  const addPlaceToTrip = useAddPlaceToTrip()
  const createTrip = useCreateTrip()
  const [isCreatingTripOpen, setIsCreatingTripOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!place) return null

  async function handleSelectTrip(tripId: string) {
    if (!place) return
    setErrorMessage('')
    try {
      await addPlaceToTrip.mutateAsync({ tripId, placeId: place.id })
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler')
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[80vh] flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            "{place.name}" zu Trip hinzufügen
          </h2>

          {isLoading && <p className="text-slate-500 text-sm">Trips werden geladen...</p>}

          {!isLoading && trips.length === 0 && (
            <p className="text-slate-500 text-sm mb-4">Du hast noch keine Trips angelegt.</p>
          )}

          {!isLoading && trips.length > 0 && (
            <ul className="space-y-2 mb-4 overflow-y-auto">
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
            + Neuen Trip anlegen
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
              Schließen
            </button>
          </div>
        </div>
      </div>

      <TripFormModal
        isOpen={isCreatingTripOpen}
        onClose={() => setIsCreatingTripOpen(false)}
        onSave={handleCreateTripWithPlace}
      />
    </>
  )
}

export default AddToTripModal
