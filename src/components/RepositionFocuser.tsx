import { point } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

const BAR_SPACE = 140
const TOP_SPACE = 90
const PAN_DURATION = 0.6

type Props = { placeId: string | null; latitude?: number; longitude?: number }

function RepositionFocuser({ placeId, latitude, longitude }: Props) {
  const map = useMap()
  const focusedId = useRef<string | null>(null)

  useEffect(() => {
    if (!placeId || latitude == null || longitude == null) {
      focusedId.current = null
      return
    }
    if (focusedId.current === placeId) return
    focusedId.current = placeId

    const zoom = map.getZoom()
    const size = map.getSize()
    const targetY = (TOP_SPACE + (size.y - BAR_SPACE)) / 2
    const markerPoint = map.project([latitude, longitude], zoom)
    const center = markerPoint.subtract(point(size.x / 2, targetY)).add(size.divideBy(2))
    map.panTo(map.unproject(center, zoom), { duration: PAN_DURATION })
  }, [map, placeId, latitude, longitude])

  return null
}

export default RepositionFocuser
