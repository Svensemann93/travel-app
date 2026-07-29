import { memo, useCallback, useState } from 'react'
import { Marker } from 'react-leaflet'
import type { PublicPlace, PublicPlacePhoto } from '../types/place'
import Lightbox from './Lightbox'
import PublicPlacePopup from './PublicPlacePopup'
import { getPublicMarkerIcon, getVisitedMarkerIcon, getWishedMarkerIcon } from '../lib/leafletIcons'
import { publicMarkerVariant } from '../lib/publicMarkers'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

type PhotoClick = (photos: PublicPlacePhoto[], index: number) => void

type Props = {
  places: PublicPlace[]
  onMarkVisited: (placeId: string) => void
  onEditVisit: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onToggleWish: (place: PublicPlace) => void
}

const ICON_FOR = {
  visited: getVisitedMarkerIcon,
  wished: getWishedMarkerIcon,
  plain: getPublicMarkerIcon,
}

type MarkerProps = {
  place: PublicPlace
  onPhotoClick: PhotoClick
  onMarkVisited: (placeId: string) => void
  onEditVisit: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onToggleWish: (place: PublicPlace) => void
}

const PublicMarker = memo(function PublicMarker({
  place,
  onPhotoClick,
  onMarkVisited,
  onEditVisit,
  onAddToTrip,
  onToggleWish,
}: MarkerProps) {
  const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
  const icon = ICON_FOR[publicMarkerVariant(place)](category.color)
  return (
    <Marker position={[place.latitude, place.longitude]} icon={icon}>
      <PublicPlacePopup
        place={place}
        onPhotoClick={onPhotoClick}
        onMarkVisited={onMarkVisited}
        onEditVisit={onEditVisit}
        onAddToTrip={onAddToTrip}
        onToggleWish={onToggleWish}
      />
    </Marker>
  )
})

function PublicPlaceMarkers({
  places,
  onMarkVisited,
  onEditVisit,
  onAddToTrip,
  onToggleWish,
}: Props) {
  const [lightbox, setLightbox] = useState<{ photos: PublicPlacePhoto[]; index: number } | null>(
    null,
  )
  const handlePhotoClick = useCallback<PhotoClick>(
    (photos, index) => setLightbox({ photos, index }),
    [],
  )

  return (
    <>
      {places.map((place) => (
        <PublicMarker
          key={place.id}
          place={place}
          onPhotoClick={handlePhotoClick}
          onMarkVisited={onMarkVisited}
          onEditVisit={onEditVisit}
          onAddToTrip={onAddToTrip}
          onToggleWish={onToggleWish}
        />
      ))}

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

export default PublicPlaceMarkers
