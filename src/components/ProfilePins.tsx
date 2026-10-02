import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { searchPlaces, sortPlaces, type PlaceSort } from '../lib/placesList'
import { groupByCountry } from '../lib/groupByCountry'
import type { CategoryId } from '../lib/categories'
import QueryBoundary from './QueryBoundary'
import ListSkeleton from './ListSkeleton'
import EmptyState from './EmptyState'
import PlacesGroupedList from './PlacesGroupedList'
import PlacesListControls from './PlacesListControls'

function ProfilePins() {
  const { t, i18n } = useTranslation(['profile', 'places', 'category'])
  const { data: places = [], isLoading, isError, error, refetch } = usePlaces()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PlaceSort>('visited')
  const [grouped, setGrouped] = useState(false)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())

  const groups = useMemo(() => {
    const label = (id: CategoryId) => t(`category:${id}`)
    const matching = searchPlaces(places, query)
    const visible = sortPlaces(matching, sort, i18n.language, label)
    if (!grouped) return [{ code: null, name: '', items: visible }]
    return groupByCountry(visible, i18n.language)
  }, [places, query, sort, grouped, i18n.language, t])

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
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={places.length === 0}
      onRetry={() => void refetch()}
      loading={<ListSkeleton />}
      empty={
        <EmptyState
          title={t('profile:pinsTab.emptyTitle')}
          message={t('profile:pinsTab.emptyMessage')}
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
        <EmptyState message={t('places:search.noMatch', { query })} />
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
  )
}

export default ProfilePins
