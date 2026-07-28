import { Marker } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import Map from './Map'
import MapFitBounds from './MapFitBounds'
import MarkerCluster from './MarkerCluster'
import { getCategoryMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import type { PublicPlace } from '../types/place'

type Props = {
  places: PublicPlace[]
  onSelect: (place: PublicPlace) => void
}

function WishlistMap({ places, onSelect }: Props) {
  const { t } = useTranslation('map')

  if (places.length === 0) return null

  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-slate-500">{t('wishlist.mapTitle')}</h2>
      <div className="h-72 overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 sm:h-96 lg:h-128">
        <Map basemap="muted">
          <MarkerCluster>
            {places.map((place) => {
              const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
              return (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={getCategoryMarkerIcon(category.color)}
                  title={place.name}
                  alt={place.name}
                  eventHandlers={{ click: () => onSelect(place) }}
                />
              )
            })}
          </MarkerCluster>
          <MapFitBounds places={places} />
        </Map>
      </div>
    </section>
  )
}

export default WishlistMap
