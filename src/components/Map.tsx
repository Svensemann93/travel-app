import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import type { ReactNode } from 'react'
import type { LatLngExpression } from 'leaflet'

type Props = {
  children?: ReactNode
  center?: LatLngExpression
  zoom?: number
  scrollWheelZoom?: boolean
}

const WORLD_CENTER: LatLngExpression = [20, 0]
const WORLD_ZOOM = 2

function Map({
  children,
  center = WORLD_CENTER,
  zoom = WORLD_ZOOM,
  scrollWheelZoom = true,
}: Props) {
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}

export default Map
