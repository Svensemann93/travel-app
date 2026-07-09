import { useState } from 'react'
import { Marker } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import type { Place } from '../types/place'
import type { MyPlaceStats } from '../lib/placesApi'
import Lightbox from './Lightbox'
import PlacePopup from './PlacePopup'
import { getCategoryMarkerIcon } from '../lib/leafletIcons'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

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

  return (
    <>
      {places.map((place) => {
        const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
        const isRepositioning = place.id === repositioningId
        const position: [number, number] =
          isRepositioning && pendingPosition
            ? [pendingPosition.lat, pendingPosition.lng]
            : [place.latitude, place.longitude]

        return (
          <Marker
            key={place.id}
            position={position}
            icon={getCategoryMarkerIcon(category.color)}
            draggable={isRepositioning}
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as LeafletMarker
                const next = marker.getLatLng()
                onDragMove(next.lat, next.lng)
              },
            }}
          >
            <PlacePopup
              place={place}
              stats={stats.get(place.id)}
              onPhotoClick={(p, index) => setLightbox({ place: p, index })}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToTrip={onAddToTrip}
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

export default PlaceMarkers
