import { MapContainer, TileLayer } from 'react-leaflet'
import type { ReactNode } from 'react'
import type { LatLngExpression } from 'leaflet'

type Props = {
  children?: ReactNode
  center?: LatLngExpression
  zoom?: number
}

const WORLD_CENTER: LatLngExpression = [20, 0]
const WORLD_ZOOM = 2

function Map({ children, center = WORLD_CENTER, zoom = WORLD_ZOOM }: Props) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}

export default Map
