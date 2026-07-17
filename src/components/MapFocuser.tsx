import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { FocusPoint } from '../lib/focusPoint'

type Props = {
  place: FocusPoint | null
}

function MapFocuser({ place }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!place) return
    const el = map.getContainer()
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return
    map.flyTo([place.latitude, place.longitude], 15)
  }, [place, map])

  return null
}

export default MapFocuser
