import { useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import type { PublicBounds } from '../lib/publicBounds'

type Props = {
  onChange: (bounds: PublicBounds) => void
}

function toBounds(map: LeafletMap): PublicBounds {
  const b = map.getBounds()
  return {
    minLat: b.getSouth(),
    maxLat: b.getNorth(),
    minLng: b.getWest(),
    maxLng: b.getEast(),
  }
}

function MapBoundsWatcher({ onChange }: Props) {
  const map = useMap()

  useEffect(() => {
    onChange(toBounds(map))
  }, [map, onChange])

  useMapEvents({
    moveend: (e) => onChange(toBounds(e.target)),
    zoomend: (e) => onChange(toBounds(e.target)),
  })

  return null
}

export default MapBoundsWatcher
