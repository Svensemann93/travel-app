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
}

function PlaceMarkers({ places }: Props) {
  return (
    <>
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon}>
          <Popup>
            <strong>{place.name}</strong>
            {place.description && <p className="mt-1">{place.description}</p>}
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default PlaceMarkers
