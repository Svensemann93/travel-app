import { memo } from 'react'
import MarkerCluster from './MarkerCluster'
import PlaceMarkers from './PlaceMarkers'
import PublicPlaceMarkers from './PublicPlaceMarkers'
import type { Place, PublicPlace } from '../types/place'
import type { MyPlaceStats } from '../lib/placesApi'

type Props = {
  clustered: boolean
  ownPlaces: Place[]
  stats: Map<string, MyPlaceStats>
  repositioningId: string | null
  pendingPosition: { lat: number; lng: number } | null
  onDragMove: (latitude: number, longitude: number) => void
  onEditOwn: (place: Place) => void
  onDeleteOwn: (place: Place) => void
  onAddOwnToTrip: (place: Place) => void
  publicPlaces: PublicPlace[]
  onMarkVisited: (placeId: string) => void
  onEditVisit: (place: PublicPlace) => void
  onAddPublicToTrip: (place: PublicPlace) => void
  onToggleWish: (place: PublicPlace) => void
  isSaving: boolean
}

function PlacesClusterLayer(props: Props) {
  return (
    <MarkerCluster clustered={props.clustered}>
      <PlaceMarkers
        places={props.ownPlaces}
        stats={props.stats}
        repositioningId={props.repositioningId}
        pendingPosition={props.pendingPosition}
        onDragMove={props.onDragMove}
        onEdit={props.onEditOwn}
        onDelete={props.onDeleteOwn}
        onAddToTrip={props.onAddOwnToTrip}
      />
      <PublicPlaceMarkers
        places={props.publicPlaces}
        onMarkVisited={props.onMarkVisited}
        onEditVisit={props.onEditVisit}
        onAddToTrip={props.onAddPublicToTrip}
        onToggleWish={props.onToggleWish}
        isSaving={props.isSaving}
      />
    </MarkerCluster>
  )
}

function ownSignature(places: Place[]): string {
  return places
    .map((p) => JSON.stringify(p))
    .sort()
    .join('|')
}

function publicSignature(places: PublicPlace[]): string {
  return places
    .map((p) => JSON.stringify(p))
    .sort()
    .join('|')
}

function arePropsEqual(prev: Props, next: Props): boolean {
  return (
    prev.clustered === next.clustered &&
    prev.repositioningId === next.repositioningId &&
    prev.pendingPosition === next.pendingPosition &&
    prev.isSaving === next.isSaving &&
    prev.stats === next.stats &&
    prev.onDragMove === next.onDragMove &&
    prev.onEditOwn === next.onEditOwn &&
    prev.onDeleteOwn === next.onDeleteOwn &&
    prev.onAddOwnToTrip === next.onAddOwnToTrip &&
    prev.onMarkVisited === next.onMarkVisited &&
    prev.onEditVisit === next.onEditVisit &&
    prev.onAddPublicToTrip === next.onAddPublicToTrip &&
    prev.onToggleWish === next.onToggleWish &&
    ownSignature(prev.ownPlaces) === ownSignature(next.ownPlaces) &&
    publicSignature(prev.publicPlaces) === publicSignature(next.publicPlaces)
  )
}

export default memo(PlacesClusterLayer, arePropsEqual)
