import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/AppHeader'
import TripFormModal from '../components/TripFormModal'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import EmptyState from '../components/EmptyState'
import { useCreateTrip, useTrips } from '../hooks/useTrips'
import { formatDateRange } from '../lib/dateFormat'
import type { TripInput } from '../types/trip'

function TripsListPage() {
  const { t } = useTranslation('trips')
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips()
  const createTrip = useCreateTrip()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  async function handleCreate(data: TripInput) {
    await createTrip.mutateAsync(data)
  }

  const newTripButton = (
    <button
      onClick={() => setIsCreateOpen(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
    >
      {t('new')}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{t('title')}</h2>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            {t('new')}
          </button>
        </div>

        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={trips.length === 0}
          onRetry={() => void refetch()}
          loading={<ListSkeleton />}
          empty={
            <EmptyState
              title={t('empty.title')}
              message={t('empty.message')}
              action={newTripButton}
            />
          }
        >
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
        </QueryBoundary>
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
