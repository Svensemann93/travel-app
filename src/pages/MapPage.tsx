import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { LatLng } from 'leaflet'
import { useAuth } from '../hooks/useAuth'
import { useCreatePlace, useDeletePlace, usePlaces, useUpdatePlace } from '../hooks/usePlaces'
import { supabase } from '../lib/supabase'
import Map from '../components/Map'
import MapClickHandler from '../components/MapClickHandler'
import MapFocuser from '../components/MapFocuser'
import PlaceMarkers from '../components/PlaceMarkers'
import PlaceFormModal from '../components/PlaceFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Place } from '../types/place'
import MapEmptyState from '../components/MapEmptyState'
import MapLoadingIndicator from '../components/MapLoadingIndicator'

type PlaceFormData = {
  name: string
  description: string
  rating: number | null
  price_level: number | null
  website_url: string
  photos: File[]
  photosToDelete: string[]
}

function MapPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: places = [], isLoading } = usePlaces()
  const createPlace = useCreatePlace()
  const updatePlace = useUpdatePlace()
  const deletePlace = useDeletePlace()
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [deletingPlace, setDeletingPlace] = useState<Place | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const focusId = searchParams.get('focus')
  const focusedPlace = focusId ? (places.find((p) => p.id === focusId) ?? null) : null

  useEffect(() => {
    if (focusId && focusedPlace) {
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [focusId, focusedPlace, setSearchParams])

  async function handleLogout() {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login')
  }

  function handleMapClick(latlng: LatLng) {
    setClickedPosition(latlng)
  }

  async function handleCreatePlace(data: PlaceFormData) {
    if (!clickedPosition) return
    await createPlace.mutateAsync({
      data: {
        name: data.name,
        description: data.description || null,
        rating: data.rating,
        price_level: data.price_level,
        website_url: data.website_url || null,
        latitude: clickedPosition.lat,
        longitude: clickedPosition.lng,
      },
      photos: data.photos,
    })
  }

  async function handleUpdatePlace(data: PlaceFormData) {
    if (!editingPlace) return
    await updatePlace.mutateAsync({
      id: editingPlace.id,
      data: {
        name: data.name,
        description: data.description || null,
        rating: data.rating,
        price_level: data.price_level,
        website_url: data.website_url || null,
      },
      photosToAdd: data.photos,
      photoIdsToDelete: data.photosToDelete,
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
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-slate-800">Travel App</h1>
          <nav className="flex gap-4">
            <Link to="/" className="text-sm font-semibold text-slate-900">
              Karte
            </Link>
            <Link to="/places" className="text-sm text-slate-600 hover:text-slate-900">
              Meine Orte
            </Link>
            <Link to="/profile" className="text-sm text-slate-600 hover:text-slate-900">
              Profil
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{profile?.username ?? user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors text-sm"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        <Map>
          <PlaceMarkers
            places={places}
            onEdit={(place) => setEditingPlace(place)}
            onDelete={(place) => setDeletingPlace(place)}
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <MapFocuser place={focusedPlace} />
        </Map>
        {isLoading && <MapLoadingIndicator />}
        {!isLoading && places.length === 0 && <MapEmptyState />}
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
        initialData={
          editingPlace
            ? {
                name: editingPlace.name,
                description: editingPlace.description ?? '',
                rating: editingPlace.rating,
                price_level: editingPlace.price_level,
                website_url: editingPlace.website_url ?? '',
                existingPhotos: editingPlace.photos ?? [],
              }
            : undefined
        }
        onClose={() => setEditingPlace(null)}
        onSave={handleUpdatePlace}
      />

      <ConfirmDialog
        isOpen={deletingPlace !== null}
        title="Ort löschen"
        message={`Möchtest du "${deletingPlace?.name}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`}
        confirmLabel="Löschen"
        isProcessing={deletePlace.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlace(null)}
      />
    </div>
  )
}

export default MapPage
