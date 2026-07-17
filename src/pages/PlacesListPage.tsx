import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { useCategoryFilter } from '../contexts/categoryFilter'
import { filterPlacesByCategory } from '../lib/filterPlaces'
import { searchPlaces, sortPlaces } from '../lib/placesList'
import { groupByCountry } from '../lib/groupByCountry'
import type { PlaceSort } from '../lib/placesList'
import type { CategoryId } from '../lib/categories'
import AppHeader from '../components/AppHeader'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import EmptyState from '../components/EmptyState'
import PlacesGroupedList from '../components/PlacesGroupedList'
import PlacesListControls from '../components/PlacesListControls'

function PlacesListPage() {
  const { t, i18n } = useTranslation(['places', 'category'])
  const { data: places = [], isLoading, isError, error, refetch } = usePlaces()
  const { selected } = useCategoryFilter()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PlaceSort>('visited')
  const [grouped, setGrouped] = useState(false)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())

  const groups = useMemo(() => {
    const label = (id: CategoryId) => t(`category:${id}`)
    const matching = searchPlaces(filterPlacesByCategory(places, selected), query)
    const visible = sortPlaces(matching, sort, i18n.language, label)
    if (!grouped) return [{ code: null, name: '', items: visible }]
    return groupByCountry(visible, i18n.language)
  }, [places, selected, query, sort, grouped, i18n.language, t])

  const visibleCount = groups.reduce((sum, group) => sum + group.items.length, 0)

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-4xl p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">{t('places:title')}</h2>

        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={places.length === 0}
          onRetry={() => void refetch()}
          loading={<ListSkeleton />}
          empty={
            <EmptyState
              title={t('places:empty.title')}
              action={
                <Link
                  to="/"
                  className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  {t('places:empty.toMap')}
                </Link>
              }
            />
          }
        >
          <PlacesListControls
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
            grouped={grouped}
            onGroupedChange={setGrouped}
          />

          {visibleCount === 0 ? (
            <EmptyState
              message={query ? t('places:search.noMatch', { query }) : t('places:noFilterMatch')}
            />
          ) : (
            <PlacesGroupedList
              groups={groups}
              grouped={grouped}
              collapsed={collapsed}
              onToggleGroup={toggleGroup}
              onPlaceClick={(placeId) => navigate(`/?focus=${placeId}`)}
            />
          )}
        </QueryBoundary>
      </main>
    </div>
  )
}

export default PlacesListPage
