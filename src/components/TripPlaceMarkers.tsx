import { Marker, Popup } from 'react-leaflet'
import type { Place } from '../types/place'
import SignedImage from './SignedImage'
import { getNumberedMarkerIcon } from '../lib/leafletIcons'

export type NumberedPlace = { place: Place; number: number; id?: string }

type Props = {
  places: NumberedPlace[]
  activeId?: string | null
  onSelect?: (id: string) => void
}

function TripPlaceMarkers({ places, activeId = null, onSelect }: Props) {
  return (
    <>
      {places.map(({ place, number, id }) => {
        const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]
        const isActive = id != null && id === activeId
        return (
          <Marker
            key={`${id ?? place.id}-${isActive ? 'active' : 'idle'}`}
            position={[place.latitude, place.longitude]}
            icon={getNumberedMarkerIcon(number, isActive)}
            zIndexOffset={isActive ? 1000 : 0}
            eventHandlers={onSelect && id ? { click: () => onSelect(id) } : undefined}
          >
            <Popup minWidth={200}>
              <div className="space-y-2">
                {firstPhoto && (
                  <SignedImage
                    path={firstPhoto.thumb_url ?? firstPhoto.url}
                    alt={place.name}
                    className="h-32 w-48 object-cover rounded"
                  />
                )}
                <strong className="text-base block">{place.name}</strong>
                {place.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">{place.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

export default TripPlaceMarkers
