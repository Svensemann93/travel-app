import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LatLng } from 'leaflet'
import { useAuth } from '../hooks/useAuth'
import { usePlaces } from '../hooks/usePlaces'
import { supabase } from '../lib/supabase'
import Map from '../components/Map'
import MapClickHandler from '../components/MapClickHandler'
import PlaceMarkers from '../components/PlaceMarkers'
import PlaceFormModal from '../components/PlaceFormModal'

function MapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { places, reload } = usePlaces()
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function handleMapClick(latlng: LatLng) {
    setClickedPosition(latlng)
  }

  async function handleSavePlace(data: { name: string; description: string }) {
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

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Travel App</h1>
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
          <PlaceMarkers places={places} />
          <MapClickHandler onMapClick={handleMapClick} />
        </Map>
      </main>

      <PlaceFormModal
        isOpen={clickedPosition !== null}
        latitude={clickedPosition?.lat ?? 0}
        longitude={clickedPosition?.lng ?? 0}
        onClose={() => setClickedPosition(null)}
        onSave={handleSavePlace}
      />
    </div>
  )
}

export default MapPage