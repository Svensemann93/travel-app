import { Marker } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import Map from './Map'
import MapFitBounds from './MapFitBounds'
import MarkerCluster from './MarkerCluster'
import { getCategoryMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import type { ReviewPoint } from '../lib/yearReview'

type Props = {
  points: ReviewPoint[]
  onSelect: (placeId: string) => void
}

function YearReviewMap({ points, onSelect }: Props) {
  const { t } = useTranslation('review')

  if (points.length === 0) return null

  return (
    <section className="mt-6">
      <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {t('map.title')}
      </h2>
      <div className="h-[22rem] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
        <Map basemap="muted">
          <MarkerCluster>
            {points.map((point) => {
              const category = CATEGORY_MAP[point.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
              return (
                <Marker
                  key={point.placeId}
                  position={[point.latitude, point.longitude]}
                  icon={getCategoryMarkerIcon(category.color)}
                  title={point.name}
                  alt={point.name}
                  eventHandlers={{ click: () => onSelect(point.placeId) }}
                />
              )
            })}
          </MarkerCluster>
          <MapFitBounds places={points} />
        </Map>
      </div>
    </section>
  )
}

export default YearReviewMap
