import { DivIcon } from 'leaflet'

const numberedIconCache = new Map<string, DivIcon>()

export function getNumberedMarkerIcon(number: number, active = false): DivIcon {
  const key = `${number}-${active ? 'a' : 'n'}`
  const cached = numberedIconCache.get(key)
  if (cached) return cached

  const fill = active ? '#39BBDE' : '#2563eb'
  const scale = active ? 1.2 : 1
  const w = 25 * scale
  const h = 41 * scale
  const fontSize = 12 * scale
  const shadow = active ? 'filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25));' : ''

  const html = `
    <div style="position: relative; width: ${w}px; height: ${h}px; ${shadow}">
      <svg viewBox="0 0 25 41" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0 C 5.6 0, 0 5.6, 0 12.5 C 0 22, 12.5 41, 12.5 41 C 12.5 41, 25 22, 25 12.5 C 25 5.6, 19.4 0, 12.5 0 Z" fill="${fill}"/>
        <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      </svg>
      <div style="position: absolute; top: 0; left: 0; width: ${w}px; height: ${
        25 * scale
      }px; display: flex; align-items: center; justify-content: center; color: ${fill}; font-weight: 700; font-size: ${fontSize}px; font-family: system-ui, sans-serif;">${number}</div>
    </div>
  `

  const icon = new DivIcon({
    html,
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [1, -(h - 7)],
  })
  numberedIconCache.set(key, icon)
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
