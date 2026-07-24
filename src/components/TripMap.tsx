import Map from './Map'
import MapFitBounds from './MapFitBounds'
import MapFocuser from './MapFocuser'
import TripPlaceMarkers from './TripPlaceMarkers'
import type { Place } from '../types/place'

type Props = {
  places: Place[]
  visibleNumbered: { place: Place; number: number }[]
  focusedPlace: Place | null
}

function TripMap({ places, visibleNumbered, focusedPlace }: Props) {
  return (
    <Map>
      <TripPlaceMarkers places={visibleNumbered} />
      <MapFitBounds places={places} />
      <MapFocuser place={focusedPlace} />
    </Map>
  )
}

export default TripMap
