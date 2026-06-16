import { useMemo } from 'react'
import LeafletMap from './Map'
import MapFitBounds from './MapFitBounds'
import MapFocuser from './MapFocuser'
import TripPlaceMarkers, { type NumberedPlace } from './TripPlaceMarkers'
import type { Place } from '../types/place'

type Props = {
  places: NumberedPlace[]
  activeId?: string | null
  onSelect?: (id: string) => void
  focus?: { place: Place; n: number } | null
}

function JournalMap({ places, activeId = null, onSelect, focus = null }: Props) {
  const boundsPlaces = useMemo(() => places.map((m) => m.place), [places])

  return (
    <LeafletMap scrollWheelZoom={false}>
      <MapFitBounds places={boundsPlaces} />
      {focus && <MapFocuser key={focus.n} place={focus.place} />}
      <TripPlaceMarkers places={places} activeId={activeId} onSelect={onSelect} />
    </LeafletMap>
  )
}

export default JournalMap
