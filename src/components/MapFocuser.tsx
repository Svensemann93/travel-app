import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Place } from '../types/place'

type Props = {
  place: Place | null
}

function MapFocuser({ place }: Props) {
  const map = useMap()

  useEffect(() => {
    if (place) {
      map.flyTo([place.latitude, place.longitude], 15)
    }
  }, [place, map])

  return null
}

export default MapFocuser
