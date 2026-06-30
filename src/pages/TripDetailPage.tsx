import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/AppHeader'
import Map from '../components/Map'
import MapFitBounds from '../components/MapFitBounds'
import MapFocuser from '../components/MapFocuser'
import CategoryFilter from '../components/CategoryFilter'
import TripDetailHeader from '../components/TripDetailHeader'
import TripDetailModals from '../components/TripDetailModals'
import DetailStatus from '../components/DetailStatus'
import EmptyState from '../components/EmptyState'
import TripPlaceList from '../components/TripPlaceList'
import TripPlaceMarkers from '../components/TripPlaceMarkers'
import { useCategoryFilter } from '../contexts/categoryFilter'
import {
  useDeleteTrip,
  useRemovePlaceFromTrip,
  useTripWithPlaces,
  useUpdateTrip,
  useUpdateTripPlace,
} from '../hooks/useTrips'
import { useCreateJournalFromTrip } from '../hooks/useJournals'
import type { JournalInput } from '../types/journal'
import type { TripInput, TripPlaceUpdateInput, TripPlaceWithPlace } from '../types/trip'
import { useFormatDate } from '../hooks/useFormatDate'

function TripDetailPage() {
  const { t } = useTranslation('trips')
  const { tripId = '' } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { data: trip, isLoading, error, refetch } = useTripWithPlaces(tripId)
  const updateTrip = useUpdateTrip()
  const deleteTrip = useDeleteTrip()
  const removePlaceFromTrip = useRemovePlaceFromTrip()
  const updateTripPlace = useUpdateTripPlace()
  const createJournalFromTrip = useCreateJournalFromTrip()
  const { selected } = useCategoryFilter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCreateJournalOpen, setIsCreateJournalOpen] = useState(false)
  const [removingPlaceId, setRemovingPlaceId] = useState<string | null>(null)
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null)
  const [editingTripPlace, setEditingTripPlace] = useState<TripPlaceWithPlace | null>(null)
  const { formatDateRange } = useFormatDate()

  const places = useMemo(() => trip?.trip_places.map((tp) => tp.place) ?? [], [trip?.trip_places])
  const numbered = useMemo(
    () => places.map((place, index) => ({ place, number: index + 1 })),
    [places],
  )
  const visibleNumbered = useMemo(
    () => numbered.filter((n) => selected.has(n.place.category)),
    [numbered, selected],
  )
  const focusedPlace = focusedPlaceId ? (places.find((p) => p.id === focusedPlaceId) ?? null) : null

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

  async function handleUpdateTripPlace(data: TripPlaceUpdateInput) {
    if (!editingTripPlace) return
    try {
      await updateTripPlace.mutateAsync({
        tripId: editingTripPlace.trip_id,
        placeId: editingTripPlace.place_id,
        data,
      })
      setEditingTripPlace(null)
    } catch (err) {
      console.error('Update trip place error:', err)
    }
  }

  async function handleCreateJournal(data: JournalInput) {
    if (!trip) return
    try {
      const journal = await createJournalFromTrip.mutateAsync({
        trip,
        title: data.title,
        description: data.description,
      })
      setIsCreateJournalOpen(false)
      navigate(`/journal/${journal.id}`)
    } catch (err) {
      console.error('Create journal error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-7xl p-4 md:p-8">
        <Link to="/trips" className="mb-4 inline-block text-sm text-slate-600 hover:text-slate-900">
          ← {t('back')}
        </Link>

        <DetailStatus
          isLoading={isLoading}
          error={error}
          isMissing={!isLoading && !error && !trip}
          onRetry={() => void refetch()}
          notFoundLabel={t('notFound')}
        />

        {trip && (
          <>
            <TripDetailHeader
              name={trip.name}
              description={trip.description}
              dateRange={formatDateRange(trip.start_date, trip.end_date)}
              onEdit={() => setIsEditOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
              onCreateJournal={() => setIsCreateJournalOpen(true)}
            />

            {trip.trip_places.length === 0 ? (
              <EmptyState message={t('noPlaces')} />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-800">
                    {t('placesHeading')}{' '}
                    <span className="text-sm font-normal text-slate-500">{t('dragToSort')}</span>
                  </h3>
                  <TripPlaceList
                    tripId={trip.id}
                    tripPlaces={trip.trip_places}
                    removingPlaceId={removingPlaceId}
                    onSelectPlace={setFocusedPlaceId}
                    onEditPlace={setEditingTripPlace}
                    onRemovePlace={handleRemovePlace}
                  />
                </div>
                <div className="h-[60vh] lg:sticky lg:top-8 lg:h-[70vh]">
                  <div className="mb-2 hidden justify-end md:flex">
                    <CategoryFilter />
                  </div>
                  <div className="h-full md:h-[calc(100%-3rem)]">
                    <Map>
                      <TripPlaceMarkers places={visibleNumbered} />
                      <MapFitBounds places={places} />
                      <MapFocuser place={focusedPlace} />
                    </Map>
                  </div>
                </div>
              </div>
            )}

            <TripDetailModals
              trip={trip}
              isEditOpen={isEditOpen}
              isDeleteOpen={isDeleteOpen}
              isJournalOpen={isCreateJournalOpen}
              editingTripPlace={editingTripPlace}
              isUpdatingPlace={updateTripPlace.isPending}
              isDeleting={deleteTrip.isPending}
              isCreatingJournal={createJournalFromTrip.isPending}
              onCloseEdit={() => setIsEditOpen(false)}
              onCloseDelete={() => setIsDeleteOpen(false)}
              onCloseJournal={() => setIsCreateJournalOpen(false)}
              onCloseEditingPlace={() => setEditingTripPlace(null)}
              onSaveTrip={handleUpdate}
              onSaveTripPlace={handleUpdateTripPlace}
              onConfirmDelete={handleConfirmDelete}
              onCreateJournal={handleCreateJournal}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default TripDetailPage
