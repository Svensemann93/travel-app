import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import Map from '../components/Map'
import MapFitBounds from '../components/MapFitBounds'
import MapFocuser from '../components/MapFocuser'
import TripFormModal from '../components/TripFormModal'
import TripPlaceItem from '../components/TripPlaceItem'
import TripPlaceMarkers from '../components/TripPlaceMarkers'
import {
  useDeleteTrip,
  useRemovePlaceFromTrip,
  useTripWithPlaces,
  useUpdateTrip,
} from '../hooks/useTrips'
import { formatDateRange } from '../lib/dateFormat'
import type { TripInput } from '../types/trip'

function TripDetailPage() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { data: trip, isLoading, error } = useTripWithPlaces(tripId)
  const updateTrip = useUpdateTrip()
  const deleteTrip = useDeleteTrip()
  const removePlaceFromTrip = useRemovePlaceFromTrip()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [removingPlaceId, setRemovingPlaceId] = useState<string | null>(null)
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null)

  const places = useMemo(() => trip?.trip_places.map((tp) => tp.place) ?? [], [trip?.trip_places])

  async function handleUpdate(data: TripInput) {
    if (!trip) return
    await updateTrip.mutateAsync({ id: trip.id, data })
  }

  async function handleConfirmDelete() {
    if (!trip) return
    try {
      await deleteTrip.mutateAsync(trip.id)
      navigate('/trips')
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  async function handleRemovePlace(placeId: string) {
    if (!trip) return
    setRemovingPlaceId(placeId)
    try {
      await removePlaceFromTrip.mutateAsync({ tripId: trip.id, placeId })
      if (focusedPlaceId === placeId) setFocusedPlaceId(null)
    } catch (err) {
      console.error('Remove place error:', err)
    } finally {
      setRemovingPlaceId(null)
    }
  }

  const dateRange = trip ? formatDateRange(trip.start_date, trip.end_date) : null
  const focusedPlace = focusedPlaceId ? (places.find((p) => p.id === focusedPlaceId) ?? null) : null

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-7xl mx-auto p-8">
        <Link to="/trips" className="text-sm text-slate-600 hover:text-slate-900 mb-4 inline-block">
          ← Zurück zu meinen Trips
        </Link>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error.message}
          </div>
        )}

        {!isLoading && !error && !trip && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-slate-600">Trip nicht gefunden.</p>
          </div>
        )}

        {trip && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{trip.name}</h2>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Löschen
                  </button>
                </div>
              </div>

              {dateRange && <p className="text-sm text-slate-500 mb-2">{dateRange}</p>}

              {trip.description && (
                <p className="text-slate-600 mt-2 whitespace-pre-line">{trip.description}</p>
              )}
            </div>

            {trip.trip_places.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-slate-600">
                  Noch keine Orte in diesem Trip. Klicke auf einen Marker auf der Karte und wähle
                  diesen Trip aus, um Orte hinzuzufügen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Orte</h3>
                  <ul className="space-y-3">
                    {trip.trip_places.map((tp) => (
                      <li key={tp.place_id}>
                        <TripPlaceItem
                          place={tp.place}
                          onSelect={() => setFocusedPlaceId(tp.place_id)}
                          onRemove={() => handleRemovePlace(tp.place_id)}
                          isRemoving={removingPlaceId === tp.place_id}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="h-[60vh] lg:h-[70vh] lg:sticky lg:top-8">
                  <Map>
                    <TripPlaceMarkers places={places} />
                    <MapFitBounds places={places} />
                    <MapFocuser place={focusedPlace} />
                  </Map>
                </div>
              </div>
            )}

            <TripFormModal
              isOpen={isEditOpen}
              initialData={{
                name: trip.name,
                description: trip.description,
                start_date: trip.start_date,
                end_date: trip.end_date,
              }}
              onClose={() => setIsEditOpen(false)}
              onSave={handleUpdate}
            />
          </>
        )}
      </main>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Trip löschen"
        message={`Möchtest du "${trip?.name}" wirklich löschen? Die einzelnen Orte bleiben erhalten, nur der Trip wird entfernt.`}
        confirmLabel="Löschen"
        isProcessing={deleteTrip.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  )
}

export default TripDetailPage
