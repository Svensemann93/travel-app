import { useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import type { Place } from '../types/place'
import SignedImage from './SignedImage'
import Lightbox from './Lightbox'
import { defaultMarkerIcon } from '../lib/leafletIcons'

type Props = {
  places: Place[]
  onEdit: (place: Place) => void
  onDelete: (place: Place) => void
  onAddToTrip: (place: Place) => void
  onMove: (place: Place, latitude: number, longitude: number) => void
}

function PlaceMarkers({ places, onEdit, onDelete, onAddToTrip, onMove }: Props) {
  const [lightbox, setLightbox] = useState<{ place: Place; index: number } | null>(null)

  return (
    <>
      {places.map((place) => {
        const photos = (place.photos ?? []).slice().sort((a, b) => a.position - b.position)
        const websiteText = place.website_url
          ? place.website_url.replace('https://', '').replace('http://', '')
          : ''

        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={defaultMarkerIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as LeafletMarker
                const next = marker.getLatLng()
                onMove(place, next.lat, next.lng)
              },
            }}
          >
            <Popup minWidth={280}>
              <div className="min-w-280px space-y-2">
                {photos.length > 0 ? (
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightbox({ place, index: i })
                        }}
                        className="shrink-0 cursor-zoom-in"
                      >
                        <SignedImage
                          path={p.thumb_url ?? p.url}
                          alt={place.name}
                          className="h-40 w-56 object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}

                <strong className="text-base block">{place.name}</strong>

                {place.rating ? (
                  <div className="text-sm">
                    <span className="text-yellow-400">{'★'.repeat(place.rating)}</span>
                    <span className="text-slate-300">{'★'.repeat(5 - place.rating)}</span>
                  </div>
                ) : null}

                {place.price_level ? (
                  <div className="text-sm font-medium text-green-700">
                    {'$'.repeat(place.price_level)}
                  </div>
                ) : null}

                {place.description ? (
                  <p className="text-sm text-slate-600">{place.description}</p>
                ) : null}

                {place.website_url ? (
                  <a
                    href={place.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block truncate"
                  >
                    {websiteText}
                  </a>
                ) : null}

                <div className="flex gap-3 pt-1 border-t border-slate-100 flex-wrap">
                  <button
                    onClick={() => onAddToTrip(place)}
                    className="text-sm text-green-700 hover:underline"
                  >
                    + Zu Trip
                  </button>
                  <button
                    onClick={() => onEdit(place)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => onDelete(place)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </Popup>
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
