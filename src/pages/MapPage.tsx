import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LatLng } from 'leaflet'
import { useCreatePlace, useDeletePlace, usePlaces, useUpdatePlace } from '../hooks/usePlaces'
import { useEntryPoint } from '../hooks/useEntryPoint'
import { useReposition } from '../hooks/useReposition'
import { useFocusedPlace } from '../hooks/useFocusedPlace'
import { useCategoryFilter } from '../contexts/categoryFilter'
import { filterPlacesByCategory } from '../lib/filterPlaces'
import { placeToFormInitial } from '../hooks/usePlaceForm'
import type { PlaceFormValues } from '../hooks/usePlaceForm'
import AppHeader from '../components/AppHeader'
import Map from '../components/Map'
import MapClickHandler from '../components/MapClickHandler'
import MapFocuser from '../components/MapFocuser'
import SearchControl from '../components/SearchControl'
import PlaceMarkers from '../components/PlaceMarkers'
import PlaceFormModal from '../components/PlaceFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import AddToTripModal from '../components/AddToTripModal'
import RepositionBar from '../components/RepositionBar'
import CategoryFilter from '../components/CategoryFilter'
import MapEmptyState from '../components/MapEmptyState'
import MapLoadingIndicator from '../components/MapLoadingIndicator'
import MapErrorOverlay from '../components/MapErrorOverlay'
import LocateControl from '../components/LocateControl'
import type { Place, PublicPlace } from '../types/place'
import PopupAutoCenter from '../components/PopupAutoCenter'
import { usePublicPlaces } from '../hooks/usePublicPlaces'
import PublicPlaceMarkers from '../components/PublicPlaceMarkers'
import PublicPlacesToggle from '../components/PublicPlacesToggle'
import VisitEditModal from '../components/VisitEditModal'
import { useSetPlaceVisit, useRemovePlaceVisit } from '../hooks/usePlaceVisits'
import { isWelcomeDismissed, dismissWelcome } from '../lib/welcomeBanner'
import { useMyPlaceStats } from '../hooks/useMyPlaceStats'

function MapPage() {
  const { t } = useTranslation(['places', 'common'])
  const { data: places = [], isLoading, isError, refetch } = usePlaces()
  const { data: entryPoint, isLoading: isEntryLoading } = useEntryPoint()
  const createPlace = useCreatePlace()
  const updatePlace = useUpdatePlace()
  const deletePlace = useDeletePlace()
  const reposition = useReposition()
  const focusedPlace = useFocusedPlace(places)
  const { selected } = useCategoryFilter()
  const [showPublic, setShowPublic] = useState(true)
  const { data: publicPlaces = [] } = usePublicPlaces(true)
  const setVisit = useSetPlaceVisit()
  const removeVisit = useRemovePlaceVisit()
  const [editingVisit, setEditingVisit] = useState<PublicPlace | null>(null)
  const myPlaceStats = useMyPlaceStats()

  const visiblePlaces = useMemo(() => filterPlacesByCategory(places, selected), [places, selected])
  const visiblePublicPlaces = useMemo(
    () =>
      filterPlacesByCategory(publicPlaces, selected).filter((p) => showPublic || p.visited_by_me),
    [publicPlaces, selected, showPublic],
  )
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [deletingPlace, setDeletingPlace] = useState<Place | null>(null)
  const [addingToTripPlace, setAddingToTripPlace] = useState<Place | null>(null)
  const [welcomeDismissed, setWelcomeDismissed] = useState(isWelcomeDismissed)

  function handleDismissWelcome() {
    dismissWelcome()
    setWelcomeDismissed(true)
  }

  function handleMapClick(latlng: LatLng) {
    setClickedPosition(latlng)
  }

  function handleStartReposition() {
    if (!editingPlace) return
    reposition.start(editingPlace)
    setEditingPlace(null)
  }

  async function handleCreatePlace(data: PlaceFormValues) {
    if (!clickedPosition) return
    await createPlace.mutateAsync({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        rating: data.rating,
        price_level: data.price_level,
        website_url: data.website_url || null,
        is_public: data.isPublic,
        latitude: clickedPosition.lat,
        longitude: clickedPosition.lng,
      },
      photos: data.newPhotos,
    })
  }

  async function handleUpdatePlace(data: PlaceFormValues) {
    if (!editingPlace) return
    await updatePlace.mutateAsync({
      id: editingPlace.id,
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        rating: data.rating,
        price_level: data.price_level,
        website_url: data.website_url || null,
        is_public: data.isPublic,
      },
      photosToAdd: data.newPhotos,
      photoIdsToDelete: data.photosToDelete,
      photoVisibility: data.photoVisibility,
    })
  }

  async function handleConfirmDelete() {
    if (!deletingPlace) return
    try {
      await deletePlace.mutateAsync(deletingPlace.id)
      setDeletingPlace(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 relative">
        {isEntryLoading ? (
          <MapLoadingIndicator />
        ) : (
          <Map
            key={entryPoint ? `${entryPoint.latitude},${entryPoint.longitude}` : 'world'}
            center={entryPoint ? [entryPoint.latitude, entryPoint.longitude] : undefined}
            zoom={entryPoint ? 13 : undefined}
          >
            <SearchControl />
            <LocateControl />
            <PlaceMarkers
              places={visiblePlaces}
              stats={myPlaceStats}
              repositioningId={reposition.place?.id ?? null}
              pendingPosition={reposition.pendingPosition}
              onDragMove={reposition.dragMove}
              onEdit={(place) => setEditingPlace(place)}
              onDelete={(place) => setDeletingPlace(place)}
              onAddToTrip={(place) => setAddingToTripPlace(place)}
            />
            <PublicPlaceMarkers
              places={visiblePublicPlaces}
              onMarkVisited={(placeId) =>
                setVisit.mutate({ placeId, rating: null, priceLevel: null })
              }
              onEditVisit={(place) => setEditingVisit(place)}
              isSaving={setVisit.isPending || removeVisit.isPending}
            />
            {!reposition.place && <MapClickHandler onMapClick={handleMapClick} />}
            <MapFocuser place={focusedPlace} />
            <PopupAutoCenter />
          </Map>
        )}
        {!isEntryLoading && isLoading && <MapLoadingIndicator />}
        {!isEntryLoading && !isLoading && isError && (
          <MapErrorOverlay onRetry={() => void refetch()} />
        )}
        {!isEntryLoading && !isLoading && !isError && places.length === 0 && !welcomeDismissed && (
          <MapEmptyState onClose={handleDismissWelcome} />
        )}{' '}
        {!isEntryLoading && (places.length > 0 || publicPlaces.length > 0) && (
          <CategoryFilter className="absolute right-4 top-4 z-[1000] hidden md:block" />
        )}
        {!isEntryLoading && (
          <div className="absolute inset-x-0 top-16 z-[1000] mx-auto flex w-80 max-w-[calc(100%-24px)] justify-end md:left-auto md:right-4 md:mx-0 md:w-auto md:max-w-none">
            <PublicPlacesToggle enabled={showPublic} onToggle={() => setShowPublic((v) => !v)} />
          </div>
        )}{' '}
        {reposition.place && (
          <RepositionBar
            placeName={reposition.place.name}
            hasMoved={reposition.pendingPosition !== null}
            isSaving={reposition.isSaving}
            onSave={reposition.confirm}
            onCancel={reposition.cancel}
          />
        )}
      </main>

      <PlaceFormModal
        key={clickedPosition ? `${clickedPosition.lat}-${clickedPosition.lng}` : 'create-closed'}
        isOpen={clickedPosition !== null}
        latitude={clickedPosition?.lat ?? 0}
        longitude={clickedPosition?.lng ?? 0}
        onClose={() => setClickedPosition(null)}
        onSave={handleCreatePlace}
      />

      <PlaceFormModal
        key={editingPlace?.id ?? 'edit-closed'}
        isOpen={editingPlace !== null}
        latitude={editingPlace?.latitude ?? 0}
        longitude={editingPlace?.longitude ?? 0}
        initialData={editingPlace ? placeToFormInitial(editingPlace) : undefined}
        onClose={() => setEditingPlace(null)}
        onSave={handleUpdatePlace}
        onReposition={handleStartReposition}
      />

      <ConfirmDialog
        isOpen={deletingPlace !== null}
        title={t('delete.title')}
        message={t('delete.message', { name: deletingPlace?.name ?? '' })}
        confirmLabel={t('common:action.delete')}
        isProcessing={deletePlace.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlace(null)}
      />

      <AddToTripModal place={addingToTripPlace} onClose={() => setAddingToTripPlace(null)} />

      {editingVisit && (
        <VisitEditModal
          key={editingVisit.id}
          place={editingVisit}
          onClose={() => setEditingVisit(null)}
          onSave={(id, rating, priceLevel) => {
            setVisit.mutate({ placeId: id, rating, priceLevel })
            setEditingVisit(null)
          }}
          onRemove={(id) => {
            removeVisit.mutate(id)
            setEditingVisit(null)
          }}
          isSaving={setVisit.isPending || removeVisit.isPending}
        />
      )}
    </div>
  )
}

export default MapPage
