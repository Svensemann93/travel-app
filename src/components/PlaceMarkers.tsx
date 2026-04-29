import { useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import type { Place } from '../types/place'
import SignedImage from './SignedImage'
import Lightbox from './Lightbox'

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type Props = {
  places: Place[]
  onEdit: (place: Place) => void
  onDelete: (place: Place) => void
}

function PlaceMarkers({ places, onEdit, onDelete }: Props) {
  const [lightbox, setLightbox] = useState<{ place: Place; index: number } | null>(null)

  return (
    <>
      {places.map((place) => {
        const photos = (place.photos ?? []).slice().sort((a, b) => a.position - b.position)
        const websiteText = place.website_url
          ? place.website_url.replace('https://', '').replace('http://', '')
          : ''

        return (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon}>
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
                          path={p.url}
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

                <div className="flex gap-2 pt-1 border-t border-slate-100">
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
