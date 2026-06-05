import { DivIcon, Icon } from 'leaflet'

export const defaultMarkerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const numberedIconCache = new Map<number, DivIcon>()

export function getNumberedMarkerIcon(number: number): DivIcon {
  const cached = numberedIconCache.get(number)
  if (cached) return cached

  const html = `
    <div style="position: relative; width: 25px; height: 41px;">
      <svg viewBox="0 0 25 41" width="25" height="41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0 C 5.6 0, 0 5.6, 0 12.5 C 0 22, 12.5 41, 12.5 41 C 12.5 41, 25 22, 25 12.5 C 25 5.6, 19.4 0, 12.5 0 Z" fill="#2563eb"/>
        <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      </svg>
      <div style="position: absolute; top: 0; left: 0; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: 700; font-size: 12px; font-family: system-ui, sans-serif;">${number}</div>
    </div>
  `

  const icon = new DivIcon({
    html,
    className: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
  numberedIconCache.set(number, icon)
  return icon
}

const categoryIconCache = new Map<string, DivIcon>()

export function getCategoryMarkerIcon(color: string): DivIcon {
  const cached = categoryIconCache.get(color)
  if (cached) return cached

  const html = `
    <svg viewBox="0 0 25 41" width="25" height="41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0 C 5.6 0, 0 5.6, 0 12.5 C 0 22, 12.5 41, 12.5 41 C 12.5 41, 25 22, 25 12.5 C 25 5.6, 19.4 0, 12.5 0 Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>
  `

  const icon = new DivIcon({
    html,
    className: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
  categoryIconCache.set(color, icon)
  return icon
}
