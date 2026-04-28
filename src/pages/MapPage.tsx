import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { LatLng } from 'leaflet'
import { useAuth } from '../hooks/useAuth'
import { usePlaces } from '../hooks/usePlaces'
import { supabase } from '../lib/supabase'
import Map from '../components/Map'
import MapClickHandler from '../components/MapClickHandler'
import MapFocuser from '../components/MapFocuser'
import PlaceMarkers from '../components/PlaceMarkers'
import PlaceFormModal from '../components/PlaceFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Place } from '../types/place'

function MapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { places, reload } = usePlaces()

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

  async function handleCreatePlace(data: { name: string; description: string }) {
    if (!clickedPosition || !user) return

    const { error } = await supabase.from('places').insert({
      user_id: user.id,
      name: data.name,
      description: data.description || null,
      latitude: clickedPosition.lat,
      longitude: clickedPosition.lng,
    })

    if (error) {
      throw new Error(error.message)
    }

    await reload()
  }

  async function handleUpdatePlace(data: { name: string; description: string }) {
    if (!editingPlace) return

    const { error } = await supabase
      .from('places')
      .update({
        name: data.name,
        description: data.description || null,
      })
      .eq('id', editingPlace.id)

    if (error) {
      throw new Error(error.message)
    }

    await reload()
  }

  async function handleConfirmDelete() {
    if (!deletingPlace) return

    setIsDeleting(true)

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
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors text-sm"
          >
            Abmelden
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Map>
          <PlaceMarkers
            places={places}
            onEdit={(place) => setEditingPlace(place)}
            onDelete={(place) => setDeletingPlace(place)}
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <MapFocuser place={focusedPlace} />
        </Map>
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
            ? { name: editingPlace.name, description: editingPlace.description ?? '' }
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
