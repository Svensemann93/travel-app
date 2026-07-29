import { memo, useState } from 'react'
import { Marker } from 'react-leaflet'
import type { PublicPlace, PublicPlacePhoto } from '../types/place'
import Lightbox from './Lightbox'
import PublicPlacePopup from './PublicPlacePopup'
import { getPublicMarkerIcon, getVisitedMarkerIcon, getWishedMarkerIcon } from '../lib/leafletIcons'
import { publicMarkerVariant } from '../lib/publicMarkers'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

type Props = {
  places: PublicPlace[]
  onMarkVisited: (placeId: string) => void
  onEditVisit: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onToggleWish: (place: PublicPlace) => void
  isSaving: boolean
}

const ICON_FOR = {
  visited: getVisitedMarkerIcon,
  wished: getWishedMarkerIcon,
  plain: getPublicMarkerIcon,
}

function PublicPlaceMarkers({
  places,
  onMarkVisited,
  onEditVisit,
  onAddToTrip,
  onToggleWish,
  isSaving,
}: Props) {
  const [lightbox, setLightbox] = useState<{
    photos: PublicPlacePhoto[]
    index: number
  } | null>(null)

  return (
    <>
      {places.map((place) => {
        const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
        const icon = ICON_FOR[publicMarkerVariant(place)](category.color)
        return (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={icon}>
            <PublicPlacePopup
              place={place}
              onPhotoClick={(photos, index) => setLightbox({ photos, index })}
              onMarkVisited={onMarkVisited}
              onEditVisit={onEditVisit}
              onAddToTrip={onAddToTrip}
              onToggleWish={onToggleWish}
              isSaving={isSaving}
            />
          </Marker>
        )
      })}

      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

function placesSignature(places: PublicPlace[]): string {
  return places
    .map((p) => JSON.stringify(p))
    .sort()
    .join('|')
}

function arePropsEqual(prev: Props, next: Props): boolean {
  return (
    prev.isSaving === next.isSaving &&
    prev.onMarkVisited === next.onMarkVisited &&
    prev.onEditVisit === next.onEditVisit &&
    prev.onAddToTrip === next.onAddToTrip &&
    prev.onToggleWish === next.onToggleWish &&
    placesSignature(prev.places) === placesSignature(next.places)
  )
}

export default memo(PublicPlaceMarkers, arePropsEqual)
