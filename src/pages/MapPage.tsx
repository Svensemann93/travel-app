import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { LatLng } from 'leaflet'
import { useAuth } from '../hooks/useAuth'
import { usePlaces } from '../hooks/usePlaces'
import { supabase } from '../lib/supabase'
import { uploadPhoto, deletePhotos } from '../lib/photoStorage'
import Map from '../components/Map'
import MapClickHandler from '../components/MapClickHandler'
import MapFocuser from '../components/MapFocuser'
import PlaceMarkers from '../components/PlaceMarkers'
import PlaceFormModal from '../components/PlaceFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Place, PlacePhoto } from '../types/place'
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

function collectStoragePaths(photos: PlacePhoto[]): string[] {
  return photos.flatMap((p) => (p.thumb_url ? [p.url, p.thumb_url] : [p.url]))
}

function MapPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { places, isLoading, reload } = usePlaces()
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [deletingPlace, setDeletingPlace] = useState<Place | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
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
    navigate('/login')
  }

  function handleMapClick(latlng: LatLng) {
    setClickedPosition(latlng)
  }

  async function uploadAndInsertPhotos(
    placeId: string,
    userId: string,
    files: File[],
    startPosition: number,
  ) {
    for (let i = 0; i < files.length; i++) {
      const { fullPath, thumbPath } = await uploadPhoto(userId, placeId, files[i])
      const { error } = await supabase.from('place_photos').insert({
        place_id: placeId,
        user_id: userId,
        url: fullPath,
        thumb_url: thumbPath,
        position: startPosition + i,
      })
      if (error) throw new Error(error.message)
    }
  }

  async function handleCreatePlace(data: PlaceFormData) {
    if (!clickedPosition || !user) return

    const { data: inserted, error } = await supabase
      .from('places')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        rating: data.rating,
        price_level: data.price_level,
        website_url: data.website_url || null,
        latitude: clickedPosition.lat,
        longitude: clickedPosition.lng,
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    if (data.photos.length > 0) {
      await uploadAndInsertPhotos(inserted.id, user.id, data.photos, 0)
    }

    await reload()
  }

  async function handleUpdatePlace(data: PlaceFormData) {
    if (!editingPlace || !user) return

    const { error } = await supabase
      .from('places')
      .update({
        name: data.name,
        description: data.description || null,
        rating: data.rating,
        price_level: data.price_level,
        website_url: data.website_url || null,
      })
      .eq('id', editingPlace.id)

    if (error) throw new Error(error.message)

    if (data.photosToDelete.length > 0) {
      const toDelete = (editingPlace.photos ?? []).filter((p) => data.photosToDelete.includes(p.id))
      await deletePhotos(collectStoragePaths(toDelete))

      const { error: dbError } = await supabase
        .from('place_photos')
        .delete()
        .in('id', data.photosToDelete)
      if (dbError) throw new Error(dbError.message)
    }

    if (data.photos.length > 0) {
      const remaining = (editingPlace.photos?.length ?? 0) - data.photosToDelete.length
      await uploadAndInsertPhotos(editingPlace.id, user.id, data.photos, remaining)
    }

    await reload()
  }

  async function handleConfirmDelete() {
    if (!deletingPlace) return
    setIsDeleting(true)

    const paths = collectStoragePaths(deletingPlace.photos ?? [])
    if (paths.length > 0) {
      try {
        await deletePhotos(paths)
      } catch (err) {
        console.error('Storage cleanup failed:', err)
      }
    }

    const { error } = await supabase.from('places').delete().eq('id', deletingPlace.id)
    setIsDeleting(false)
    if (error) {
      console.error('Delete error:', error)
      return
    }
    setDeletingPlace(null)
    await reload()
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
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlace(null)}
      />
    </div>
  )
}

export default MapPage
