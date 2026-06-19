import { point } from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'

const SAFE_TOP = 110
const SAFE_BOTTOM = 24
const POPUP_TIP = 34

function PopupAutoCenter() {
  const map = useMap()

  useMapEvents({
    popupopen(e) {
      const latlng = e.popup.getLatLng()
      if (!latlng) return
      requestAnimationFrame(() => {
        const el = e.popup.getElement()
        if (!el) return
        const size = map.getSize()
        const safeCenterY = (SAFE_TOP + (size.y - SAFE_BOTTOM)) / 2
        const targetMarker = point(size.x / 2, safeCenterY + POPUP_TIP + el.offsetHeight / 2)
        const worldMarker = map.project(latlng)
        const newCenter = worldMarker.subtract(targetMarker).add(size.divideBy(2))
        map.panTo(map.unproject(newCenter), { animate: true, duration: 0.25 })
      })
    },
  })

  return null
}

export default PopupAutoCenter
