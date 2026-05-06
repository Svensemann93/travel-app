import { Link, useNavigate } from 'react-router-dom'
import { usePlaces } from '../hooks/usePlaces'
import AppHeader from '../components/AppHeader'
import SignedImage from '../components/SignedImage'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

function PlacesListPage() {
  const { data: places = [], isLoading, error } = usePlaces()
  const navigate = useNavigate()

  function handlePlaceClick(placeId: string) {
    navigate(`/?focus=${placeId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Meine Orte</h2>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error.message}
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
            {places.map((place) => {
              const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]

              return (
                <li key={place.id}>
                  <button
                    onClick={() => handlePlaceClick(place.id)}
                    className="w-full text-left bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex"
                  >
                    {firstPhoto ? (
                      <SignedImage
                        path={firstPhoto.thumb_url ?? firstPhoto.url}
                        alt={place.name}
                        className="w-24 h-24 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300 text-2xl">
                        📍
                      </div>
                    )}

                    <div className="p-4 flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800">{place.name}</h3>

                      <div className="flex items-center gap-2 mt-1">
                        {place.rating && <StarDisplay rating={place.rating} />}
                        {place.price_level && (
                          <span className="text-sm font-medium text-green-700">
                            {'$'.repeat(place.price_level)}
                          </span>
                        )}
                      </div>

                      {place.description && (
                        <p className="text-sm text-slate-600 mt-1 truncate">{place.description}</p>
                      )}

                      <p className="text-xs text-slate-400 mt-1">
                        {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}

export default PlacesListPage
