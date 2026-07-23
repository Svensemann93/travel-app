import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { LatLngBounds } from 'leaflet'

type MapPoint = {
  latitude: number
  longitude: number
}

type Props = {
  places: MapPoint[]
}

function MapFitBounds({ places }: Props) {
  const map = useMap()

  useEffect(() => {
    if (places.length === 0) return
    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 13)
      return
    }
    const bounds = new LatLngBounds(places.map((p) => [p.latitude, p.longitude]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [places, map])

  return null
}

export default MapFitBounds
