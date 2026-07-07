import { useState } from 'react'
import { Marker } from 'react-leaflet'
import type { PublicPlace } from '../types/place'
import Lightbox from './Lightbox'
import PublicPlacePopup from './PublicPlacePopup'
import { getPublicMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

function PublicPlaceMarkers({ places }: { places: PublicPlace[] }) {
  const [lightbox, setLightbox] = useState<{ place: PublicPlace; index: number } | null>(null)

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
            <PublicPlacePopup
              place={place}
              onPhotoClick={(p, index) => setLightbox({ place: p, index })}
            />
          </Marker>
        )
      })}

      {lightbox && (
        <Lightbox
          photos={lightbox.place.photos ?? []}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

export default PublicPlaceMarkers
