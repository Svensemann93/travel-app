import { memo, useCallback, useState } from 'react'
import { Marker } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import type { Place } from '../types/place'
import type { MyPlaceStats } from '../lib/placesApi'
import Lightbox from './Lightbox'
import PlacePopup from './PlacePopup'
import { getCategoryMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

type PhotoClick = (place: Place, index: number) => void

type Props = {
  places: Place[]
  stats: Map<string, MyPlaceStats>
  repositioningId: string | null
  pendingPosition: { lat: number; lng: number } | null
  onDragMove: (latitude: number, longitude: number) => void
  onEdit: (place: Place) => void
  onDelete: (place: Place) => void
  onAddToTrip: (place: Place) => void
}

type MarkerProps = {
  place: Place
  stat: MyPlaceStats | undefined
  latitude: number
  longitude: number
  draggable: boolean
  onDragMove: (latitude: number, longitude: number) => void
  onPhotoClick: PhotoClick
  onEdit: (place: Place) => void
  onDelete: (place: Place) => void
  onAddToTrip: (place: Place) => void
}

const OwnMarker = memo(function OwnMarker({
  place,
  stat,
  latitude,
  longitude,
  draggable,
  onDragMove,
  onPhotoClick,
  onEdit,
  onDelete,
  onAddToTrip,
}: MarkerProps) {
  const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
  return (
    <Marker
      position={[latitude, longitude]}
      icon={getCategoryMarkerIcon(category.color)}
      draggable={draggable}
      eventHandlers={{
        dragend: (event) => {
          const next = (event.target as LeafletMarker).getLatLng()
          onDragMove(next.lat, next.lng)
        },
      }}
    >
      <PlacePopup
        place={place}
        stats={stat}
        onPhotoClick={onPhotoClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddToTrip={onAddToTrip}
      />
    </Marker>
  )
})

function PlaceMarkers({
  places,
  stats,
  repositioningId,
  pendingPosition,
  onDragMove,
  onEdit,
  onDelete,
  onAddToTrip,
}: Props) {
  const [lightbox, setLightbox] = useState<{ place: Place; index: number } | null>(null)
  const handlePhotoClick = useCallback<PhotoClick>(
    (place, index) => setLightbox({ place, index }),
    [],
  )

  return (
    <>
      {places.map((place) => {
        const isRepositioning = place.id === repositioningId
        const latitude = isRepositioning && pendingPosition ? pendingPosition.lat : place.latitude
        const longitude = isRepositioning && pendingPosition ? pendingPosition.lng : place.longitude
        return (
          <OwnMarker
            key={place.id}
            place={place}
            stat={stats.get(place.id)}
            latitude={latitude}
            longitude={longitude}
            draggable={isRepositioning}
            onDragMove={onDragMove}
            onPhotoClick={handlePhotoClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToTrip={onAddToTrip}
          />
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

export default PlaceMarkers
