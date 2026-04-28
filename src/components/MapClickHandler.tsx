import { useMapEvents } from 'react-leaflet'
import type { LatLng } from 'leaflet'

type Props = {
  onMapClick: (latlng: LatLng) => void
}

function MapClickHandler({ onMapClick }: Props) {
  useMapEvents({
    click: (event) => {
      onMapClick(event.latlng)
    },
  })

  return null
}

export default MapClickHandler