import { Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import type { Place } from '../types/place'

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
  return (
    <>
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <strong className="text-base">{place.name}</strong>
              {place.description && <p className="mt-1 mb-2 text-slate-600">{place.description}</p>}
              <div className="flex gap-2 mt-2">
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
      ))}
    </>
  )
}

export default PlaceMarkers
