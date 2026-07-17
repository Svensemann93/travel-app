import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWishlist } from '../hooks/useWishlist'
import { useRemovePlaceWish } from '../hooks/usePlaceWishes'
import { useCategoryFilter } from '../contexts/categoryFilter'
import { filterPlacesByCategory } from '../lib/filterPlaces'
import { sortWishlist } from '../lib/wishlist'
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
import AddToTripModal from '../components/AddToTripModal'
import type { PublicPlace } from '../types/place'
import type { TripCandidate } from '../types/trip'

function WishlistPage() {
  const { t, i18n } = useTranslation(['map', 'category'])
  const { data: places = [], isLoading, isError, error, refetch } = useWishlist()
  const removeWish = useRemovePlaceWish()
  const { selected } = useCategoryFilter()
  const navigate = useNavigate()
  const [sort, setSort] = useState<WishlistSort>('added')
  const [grouped, setGrouped] = useState(false)
  const [addingToTripPlace, setAddingToTripPlace] = useState<TripCandidate | null>(null)

  const groups = useMemo(() => {
    const label = (id: CategoryId) => t(`category:${id}`)
    const filtered = filterPlacesByCategory(places, selected)
    const visible = sortWishlist(filtered, sort, i18n.language, label)
    if (!grouped) return [{ code: null, name: '', items: visible }]
    return groupByCountry(visible, i18n.language)
  }, [places, selected, sort, grouped, i18n.language, t])

  const visibleCount = groups.reduce((sum, group) => sum + group.items.length, 0)

  function handleShow(place: PublicPlace) {
    navigate(`/?lat=${place.latitude}&lng=${place.longitude}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-4xl p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800">{t('map:wishlist.title')}</h2>
          {places.length > 0 && (
            <WishlistControls
              sort={sort}
              onSortChange={setSort}
              grouped={grouped}
              onGroupedChange={setGrouped}
            />
          )}
        </div>

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
            <EmptyState message={t('map:wishlist.noFilterMatch')} />
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <WishlistGroup
                  key={group.code ?? 'all'}
                  title={grouped ? group.name : null}
                  places={group.items}
                  onShow={handleShow}
                  onAddToTrip={(place) => setAddingToTripPlace(place)}
                  onRemove={(placeId) => removeWish.mutate(placeId)}
                  isRemoving={removeWish.isPending}
                />
              ))}
            </div>
          )}
        </QueryBoundary>
      </main>

      <AddToTripModal place={addingToTripPlace} onClose={() => setAddingToTripPlace(null)} />
    </div>
  )
}

export default WishlistPage
