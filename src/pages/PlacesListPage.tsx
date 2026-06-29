import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { useCategoryFilter } from '../contexts/categoryFilter'
import { filterPlacesByCategory } from '../lib/filterPlaces'
import AppHeader from '../components/AppHeader'
import CategoryFilter from '../components/CategoryFilter'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import EmptyState from '../components/EmptyState'
import PlaceListItem from '../components/PlaceListItem'

function PlacesListPage() {
  const { t } = useTranslation('places')
  const { data: places = [], isLoading, isError, error, refetch } = usePlaces()
  const { selected } = useCategoryFilter()
  const navigate = useNavigate()

  const visiblePlaces = useMemo(() => filterPlacesByCategory(places, selected), [places, selected])

  function handlePlaceClick(placeId: string) {
    navigate(`/?focus=${placeId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="max-w-4xl mx-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800">{t('title')}</h2>
          {places.length > 0 && <CategoryFilter className="hidden md:block" />}
        </div>

        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={places.length === 0}
          onRetry={() => void refetch()}
          loading={<ListSkeleton />}
          empty={
            <EmptyState
              title={t('empty.title')}
              action={
                <Link
                  to="/"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('empty.toMap')}
                </Link>
              }
            />
          }
        >
          {visiblePlaces.length === 0 ? (
            <EmptyState message={t('noFilterMatch')} />
          ) : (
            <ul className="space-y-3">
              {visiblePlaces.map((place) => (
                <li key={place.id}>
                  <PlaceListItem place={place} onClick={handlePlaceClick} />
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </main>
    </div>
  )
}

export default PlacesListPage
