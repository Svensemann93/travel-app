import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import TripFormModal from '../components/TripFormModal'
import { useCreateTrip, useTrips } from '../hooks/useTrips'
import { formatDateRange } from '../lib/dateFormat'
import type { TripInput } from '../types/trip'

function TripsListPage() {
  const { data: trips = [], isLoading, error } = useTrips()
  const createTrip = useCreateTrip()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  async function handleCreate(data: TripInput) {
    await createTrip.mutateAsync(data)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Meine Trips</h2>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            + Neuer Trip
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
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

        {!isLoading && trips.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-slate-600 mb-4">
              Du hast noch keine Trips angelegt. Plane deine erste Reise!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Neuer Trip
            </button>
          </div>
        )}

        {trips.length > 0 && (
          <ul className="space-y-3">
            {trips.map((trip) => {
              const dateRange = formatDateRange(trip.start_date, trip.end_date)
              return (
                <li key={trip.id}>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-800">{trip.name}</h3>
                    {dateRange && <p className="text-sm text-slate-500 mt-1">{dateRange}</p>}
                    {trip.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{trip.description}</p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <TripFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
      />
    </div>
  )
}

export default TripsListPage
