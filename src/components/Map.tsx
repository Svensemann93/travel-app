import { MapContainer, TileLayer } from 'react-leaflet'

function Map() {
  return (
    <MapContainer center={[47.3769, 8.5417]} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}

export default Map
