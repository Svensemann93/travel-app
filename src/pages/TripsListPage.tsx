import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/AppHeader'
import TripCard from '../components/TripCard'
import TripsControls from '../components/TripsControls'
import TripFormModal from '../components/TripFormModal'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import EmptyState from '../components/EmptyState'
import { useCreateTrip, useTrips } from '../hooks/useTrips'
import { completedLast, hideCompletedTrips, searchTrips, sortTripsByStatus } from '../lib/tripsList'
import type { TripInput } from '../types/trip'

function TripsListPage() {
  const { t } = useTranslation('trips')
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips()
  const createTrip = useCreateTrip()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)
  const [sorted, setSorted] = useState(false)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const visibleTrips = useMemo(() => {
    let result = searchTrips(trips, query)
    result = hideCompletedTrips(result, hideCompleted)
    result = sorted ? sortTripsByStatus(result, sortDirection) : completedLast(result)
    return result
  }, [trips, query, hideCompleted, sorted, sortDirection])

  async function handleCreate(data: TripInput) {
    await createTrip.mutateAsync(data)
    setIsCreateOpen(false)
  }

  const newTripButton = (
    <button
      type="button"
      onClick={() => setIsCreateOpen(true)}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
    >
      {t('new')}
    </button>
  )

  const [hero, ...rest] = visibleTrips

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl p-6 sm:p-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-600">{t('eyebrow')}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
            <p className="mt-2 text-slate-500">{t('subtitle')}</p>
          </div>
          {trips.length > 0 && newTripButton}
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
          <TripsControls
            query={query}
            onQueryChange={setQuery}
            hideCompleted={hideCompleted}
            onHideCompletedChange={setHideCompleted}
            sorted={sorted}
            sortDirection={sortDirection}
            onSortChange={(nextSorted, nextDirection) => {
              setSorted(nextSorted)
              setSortDirection(nextDirection)
            }}
          />
          {visibleTrips.length === 0 ? (
            <EmptyState message={t('search.noMatch', { query })} />
          ) : (
            <div className="space-y-6">
              {hero && <TripCard trip={hero} hero />}
              {rest.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {rest.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </div>
          )}
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
