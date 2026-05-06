import SignedImage from './SignedImage'
import type { Place } from '../types/place'

type Props = {
  place: Place
}

function TripPlaceItem({ place }: Props) {
  const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
      {firstPhoto ? (
        <SignedImage
          path={firstPhoto.thumb_url ?? firstPhoto.url}
          alt={place.name}
          className="w-24 h-24 object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-24 h-24 bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300 text-2xl">
          📍
        </div>
      )}
      <div className="p-4 flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800">{place.name}</h4>
        {place.description && (
          <p className="text-sm text-slate-600 mt-1 line-clamp-1">{place.description}</p>
        )}
      </div>
    </div>
  )
}

export default TripPlaceItem
