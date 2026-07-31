import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import type { ReactNode } from 'react'
import type { LatLngExpression } from 'leaflet'

type Basemap = 'street' | 'muted'

type Props = {
  children?: ReactNode
  center?: LatLngExpression
  zoom?: number
  scrollWheelZoom?: boolean
  basemap?: Basemap
}

const WORLD_CENTER: LatLngExpression = [20, 0]
const WORLD_ZOOM = 2

const BASEMAPS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  muted: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
} as const

function Map({
  children,
  center = WORLD_CENTER,
  zoom = WORLD_ZOOM,
  scrollWheelZoom = true,
  basemap = 'street',
}: Props) {
  const tiles = BASEMAPS[basemap]

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={scrollWheelZoom}
      className="h-full w-full"
    >
      <ZoomControl position="bottomleft" />
      <TileLayer
        attribution={tiles.attribution}
        url={tiles.url}
        subdomains={tiles.subdomains}
        maxZoom={tiles.maxZoom}
        updateWhenZooming={false}
      />
      {children}
    </MapContainer>
  )
}

export default Map
