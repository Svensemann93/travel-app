import { useCallback, useMemo, useState } from 'react'
import { Marker } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import Map from './Map'
import MapFitBounds from './MapFitBounds'
import MarkerCluster from './MarkerCluster'
import QueryBoundary from './QueryBoundary'
import EmptyState from './EmptyState'
import ProfilePlaceCard from './ProfilePlaceCard'
import { getCategoryMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import { usePlaces } from '../hooks/usePlaces'

function ProfileMap() {
  const { t } = useTranslation('profile')
  const { data: places = [], isLoading, isError, error, refetch } = usePlaces()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const handleSelect = useCallback((id: string) => setSelectedId(id), [])

  const markers = useMemo(
    () =>
      places.map((place) => {
        const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={getCategoryMarkerIcon(category.color)}
            eventHandlers={{ click: () => handleSelect(place.id) }}
          />
        )
      }),
    [places, handleSelect],
  )

  const selected = places.find((p) => p.id === selectedId) ?? null

  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={places.length === 0}
      onRetry={() => void refetch()}
      loading={<div className="h-[26rem] animate-pulse rounded-2xl bg-slate-100" />}
      empty={<EmptyState title={t('mapTab.emptyTitle')} message={t('mapTab.emptyMessage')} />}
    >
      <div className="space-y-4">
        <div className="h-[26rem] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
          <Map basemap="muted">
            <MarkerCluster>{markers}</MarkerCluster>
            <MapFitBounds places={places} />
          </Map>
        </div>
        <ProfilePlaceCard key={selected?.id ?? 'none'} place={selected} />
      </div>
    </QueryBoundary>
  )
}

export default ProfileMap
