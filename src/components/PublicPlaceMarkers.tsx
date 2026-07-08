import { useState } from 'react'
import { Marker } from 'react-leaflet'
import type { PublicPlace } from '../types/place'
import Lightbox from './Lightbox'
import PublicPlacePopup from './PublicPlacePopup'
import { getPublicMarkerIcon, getVisitedMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

type Props = {
  places: PublicPlace[]
  onMarkVisited: (placeId: string) => void
  onEditVisit: (place: PublicPlace) => void
  isSaving: boolean
}

function PublicPlaceMarkers({ places, onMarkVisited, onEditVisit, isSaving }: Props) {
  const [lightbox, setLightbox] = useState<{ place: PublicPlace; index: number } | null>(null)

  return (
    <>
      {places.map((place) => {
        const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
        const icon = place.visited_by_me
          ? getVisitedMarkerIcon(category.color)
          : getPublicMarkerIcon(category.color)
        return (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={icon}>
            <PublicPlacePopup
              place={place}
              onPhotoClick={(p, index) => setLightbox({ place: p, index })}
              onMarkVisited={onMarkVisited}
              onEditVisit={onEditVisit}
              isSaving={isSaving}
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
