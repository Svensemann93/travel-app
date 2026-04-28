import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePlaces } from '../hooks/usePlaces'
import { supabase } from '../lib/supabase'

function PlacesListPage() {
  const { user, profile } = useAuth()
  const { places, isLoading, errorMessage } = usePlaces()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function handlePlaceClick(placeId: string) {
    navigate(`/?focus=${placeId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-slate-800">Travel App</h1>
          <nav className="flex gap-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              Karte
            </Link>
            <Link to="/places" className="text-sm font-semibold text-slate-900">
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

      <main className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Meine Orte</h2>

        {isLoading && <p className="text-slate-600">Lädt...</p>}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errorMessage}
          </div>
        )}

        {!isLoading && places.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-slate-600 mb-4">Du hast noch keine Orte gespeichert.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Zur Karte
            </Link>
          </div>
        )}

        {places.length > 0 && (
          <ul className="space-y-3">
            {places.map((place) => (
              <li key={place.id}>
                <button
                  onClick={() => handlePlaceClick(place.id)}
                  className="w-full text-left bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-slate-800">{place.name}</h3>
                  {place.description && (
                    <p className="text-sm text-slate-600 mt-1">{place.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

export default PlacesListPage
