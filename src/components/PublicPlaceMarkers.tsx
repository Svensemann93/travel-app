import { Marker } from 'react-leaflet'
import type { PublicPlace } from '../types/place'
import PublicPlacePopup from './PublicPlacePopup'
import { getPublicMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

function PublicPlaceMarkers({ places }: { places: PublicPlace[] }) {
  return (
    <>
      {places.map((place) => {
        const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={getPublicMarkerIcon(category.color)}
          >
            <PublicPlacePopup place={place} />
          </Marker>
        )
      })}
    </>
  )
}

export default PublicPlaceMarkers
