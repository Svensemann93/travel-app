import { Marker, Popup } from 'react-leaflet'
import type { Place } from '../types/place'
import SignedImage from './SignedImage'
import { getNumberedMarkerIcon } from '../lib/leafletIcons'

export type NumberedPlace = { place: Place; number: number }

type Props = {
  places: NumberedPlace[]
}

function TripPlaceMarkers({ places }: Props) {
  return (
    <>
      {places.map(({ place, number }) => {
        const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]
        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={getNumberedMarkerIcon(number)}
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
