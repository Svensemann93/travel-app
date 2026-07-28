import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWishlist } from '../hooks/useWishlist'
import { useRemovePlaceWish } from '../hooks/usePlaceWishes'
import { useCategoryFilter } from '../contexts/categoryFilter'
import { filterPlacesByCategory } from '../lib/filterPlaces'
import { filterWishlistBySearch, sortWishlist } from '../lib/wishlist'
import { groupByCountry } from '../lib/groupByCountry'
import type { WishlistSort } from '../lib/wishlist'
import type { CategoryId } from '../lib/categories'
import AppHeader from '../components/AppHeader'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import EmptyState from '../components/EmptyState'
import WishlistEmpty from '../components/WishlistEmpty'
import WishlistControls from '../components/WishlistControls'
import WishlistGroup from '../components/WishlistGroup'
import WishlistList from '../components/WishlistList'
import WishlistMap from '../components/WishlistMap'
import AddToTripModal from '../components/AddToTripModal'
import type { PublicPlace } from '../types/place'
import type { TripCandidate } from '../types/trip'

function WishlistPage() {
  const { t, i18n } = useTranslation(['map', 'category'])
  const { data: places = [], isLoading, isError, error, refetch } = useWishlist()
  const removeWish = useRemovePlaceWish()
  const { selected } = useCategoryFilter()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<WishlistSort>('added')
  const [grouped, setGrouped] = useState(true)
  const [addingToTripPlace, setAddingToTripPlace] = useState<TripCandidate | null>(null)

  const groups = useMemo(() => {
    const label = (id: CategoryId) => t(`category:${id}`)
    const byCategory = filterPlacesByCategory(places, selected)
    const bySearch = filterWishlistBySearch(byCategory, search)
    const visible = sortWishlist(bySearch, sort, i18n.language, label)
    if (!grouped) return [{ code: null, name: '', items: visible }]
    return groupByCountry(visible, i18n.language)
  }, [places, selected, search, sort, grouped, i18n.language, t])

  const visiblePlaces = groups.flatMap((group) => group.items)
  const visibleCount = visiblePlaces.length
  const countryCount = new Set(places.map((p) => p.country_code).filter(Boolean)).size

  function handleShow(place: PublicPlace) {
    navigate(`/?lat=${place.latitude}&lng=${place.longitude}`)
  }

  function handleAddToTrip(place: PublicPlace) {
    setAddingToTripPlace(place)
  }

  function handleRemove(placeId: string) {
    removeWish.mutate(placeId)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-6xl p-6 sm:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-sky-600">{t('wishlist.eyebrow')}</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {t('wishlist.title')}
          </h2>
          {places.length > 0 && (
            <p className="mt-2 text-slate-500">
              {t('wishlist.summaryPlaces', { count: places.length })}{' '}
              {t('wishlist.summaryCountries', { count: countryCount })}
            </p>
          )}
        </header>
        {places.length > 0 && (
          <WishlistControls
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            grouped={grouped}
            onGroupedChange={setGrouped}
          />
        )}
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={places.length === 0}
          onRetry={() => void refetch()}
          loading={<ListSkeleton />}
          empty={<WishlistEmpty />}
        >
          {visibleCount === 0 ? (
            <EmptyState message={t('wishlist.noFilterMatch')} />
          ) : (
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
              <div className="min-w-0">
                {grouped ? (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <WishlistGroup
                        key={group.code ?? 'none'}
                        name={group.name}
                        places={group.items}
                        onShow={handleShow}
                        onAddToTrip={handleAddToTrip}
                        onRemove={handleRemove}
                        isRemoving={removeWish.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <WishlistList
                    places={groups[0].items}
                    onShow={handleShow}
                    onAddToTrip={handleAddToTrip}
                    onRemove={handleRemove}
                    isRemoving={removeWish.isPending}
                  />
                )}
              </div>
              <div className="mt-6 lg:mt-0 lg:sticky lg:top-8">
                <WishlistMap places={visiblePlaces} onSelect={handleShow} />
              </div>
            </div>
          )}{' '}
        </QueryBoundary>
      </main>

      <AddToTripModal place={addingToTripPlace} onClose={() => setAddingToTripPlace(null)} />
    </div>
  )
}

export default WishlistPage
