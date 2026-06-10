import LeafletMap from './Map'
import MapFitBounds from './MapFitBounds'
import TripPlaceMarkers, { type NumberedPlace } from './TripPlaceMarkers'

type Props = { places: NumberedPlace[] }

function JournalMap({ places }: Props) {
  return (
    <LeafletMap scrollWheelZoom={false}>
      <MapFitBounds places={places.map((m) => m.place)} />
      <TripPlaceMarkers places={places} />
    </LeafletMap>
  )
}

export default JournalMap
