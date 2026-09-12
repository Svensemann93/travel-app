import { useCallback, useMemo, useState } from 'react'
import { Marker, Polyline } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import Map from './Map'
import MapFitBounds from './MapFitBounds'
import MarkerCluster from './MarkerCluster'
import QueryBoundary from './QueryBoundary'
import EmptyState from './EmptyState'
import ProfilePlaceCard from './ProfilePlaceCard'
import ProfileMapThemes from './ProfileMapThemes'
import { getCategoryMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import { usePlaces } from '../hooks/usePlaces'
import { useWishlist } from '../hooks/useWishlist'
import { useMyTripPlaces } from '../hooks/useMyTripPlaces'
import { useMyTripRoutes } from '../hooks/useMyTripRoutes'
import { buildTripRoutes } from '../lib/tripRoutes'
import { curvePath } from '../lib/curvedPath'
import {
  dedupePoints,
  placesToPoints,
  publicPlacesToPoints,
  visitedPlacesToPoints,
  type ShowcaseTheme,
} from '../lib/showcasePoints'
import { usePlaceJournals } from '../hooks/usePlaceJournals'
import { journalsByPlace } from '../lib/placeJournals'

function ProfileMap() {
  const { t } = useTranslation('profile')
  const [theme, setTheme] = useState<ShowcaseTheme>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const places = usePlaces()
  const wishlist = useWishlist()
  const tripPlaces = useMyTripPlaces()
  const tripRoutes = useMyTripRoutes()
  const placeJournals = usePlaceJournals()

  const query = theme === 'wishlist' ? wishlist : theme === 'planned' ? tripPlaces : places

  const points = useMemo(() => {
    if (theme === 'wishlist') return dedupePoints(publicPlacesToPoints(wishlist.data ?? []))
    if (theme === 'planned') return dedupePoints(placesToPoints(tripPlaces.data ?? []))
    if (theme === 'visited') return dedupePoints(visitedPlacesToPoints(places.data ?? []))
    return dedupePoints(placesToPoints(places.data ?? []))
  }, [theme, places.data, wishlist.data, tripPlaces.data])

  const routes = useMemo(
    () => (theme === 'planned' ? buildTripRoutes(tripRoutes.data ?? []) : []),
    [theme, tripRoutes.data],
  )

  const journalsForPlace = useMemo(
    () => journalsByPlace(placeJournals.data ?? []),
    [placeJournals.data],
  )

  const handleSelect = useCallback((id: string) => setSelectedId(id), [])

  const markers = useMemo(
    () =>
      points.map((point) => {
        const category = CATEGORY_MAP[point.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
        return (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={getCategoryMarkerIcon(category.color)}
            eventHandlers={{ click: () => handleSelect(point.id) }}
          />
        )
      }),
    [points, handleSelect],
  )

  const selected = points.find((point) => point.id === selectedId) ?? null

  function handleTheme(next: ShowcaseTheme) {
    setTheme(next)
    setSelectedId(null)
  }

  return (
    <div className="space-y-4">
      <ProfileMapThemes active={theme} onSelect={handleTheme} />
      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={points.length === 0}
        onRetry={() => void query.refetch()}
        loading={<div className="h-[26rem] animate-pulse rounded-2xl bg-slate-100" />}
        empty={
          <EmptyState title={t('mapTab.emptyTitle')} message={t(`mapThemes.empty.${theme}`)} />
        }
      >
        <div className="space-y-4">
          <div className="h-[26rem] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
            <Map basemap="muted">
              {routes.map((route) => (
                <Polyline
                  key={route.tripId}
                  positions={curvePath(route.points)}
                  pathOptions={{
                    color: '#39BBDE',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '6 8',
                    lineCap: 'round',
                  }}
                />
              ))}
              <MarkerCluster>{markers}</MarkerCluster>
              <MapFitBounds places={points} />
            </Map>
          </div>
          <ProfilePlaceCard
            key={selected?.id ?? 'none'}
            point={selected}
            journals={selected ? (journalsForPlace[selected.id] ?? []) : []}
          />
        </div>
      </QueryBoundary>
    </div>
  )
}

export default ProfileMap
