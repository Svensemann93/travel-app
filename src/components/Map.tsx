import { MapContainer, TileLayer } from 'react-leaflet'
import type { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

function Map({ children }: Props) {
  return (
    <MapContainer center={[47.3769, 8.5417]} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}

export default Map
