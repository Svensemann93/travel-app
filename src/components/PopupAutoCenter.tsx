import { point } from 'leaflet'
import { useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

const SAFE_TOP = 110
const SAFE_BOTTOM = 24
const POPUP_TIP = 34
const DETAIL_ZOOM = 15
const FLY_DURATION = 1.2

function PopupAutoCenter() {
  const map = useMap()
  const flying = useRef(false)

  useMapEvents({
    popupopen(e) {
      const latlng = e.popup.getLatLng()
      if (!latlng) return
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = e.popup.getElement()
          if (!el) return
          const zoom = Math.max(map.getZoom(), DETAIL_ZOOM)
          const size = map.getSize()
          const safeCenterY = (SAFE_TOP + (size.y - SAFE_BOTTOM)) / 2
          const markerY = Math.min(
            safeCenterY + (POPUP_TIP + el.offsetHeight) / 2,
            size.y - SAFE_BOTTOM,
          )
          const markerPoint = map.project(latlng, zoom)
          const center = markerPoint.subtract(point(size.x / 2, markerY)).add(size.divideBy(2))
          flying.current = true
          map.flyTo(map.unproject(center, zoom), zoom, { duration: FLY_DURATION })
          map.once('moveend', () => {
            flying.current = false
          })
        }),
      )
    },
    zoomstart() {
      if (!flying.current) map.closePopup()
    },
  })

  return null
}

export default PopupAutoCenter
