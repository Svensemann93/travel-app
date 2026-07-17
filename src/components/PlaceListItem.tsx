import SignedImage from './SignedImage'
import StarDisplay from './StarDisplay'
import { visitOf } from '../lib/placeVisits'
import type { Place } from '../types/place'

type Props = {
  place: Place
  onClick: (placeId: string) => void
}

function PlaceListItem({ place, onClick }: Props) {
  const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]
  const visit = visitOf(place)

  return (
    <button
      onClick={() => onClick(place.id)}
      className="flex w-full overflow-hidden rounded-lg bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {firstPhoto ? (
        <SignedImage
          path={firstPhoto.thumb_url ?? firstPhoto.url}
          alt={place.name}
          className="w-24 flex-shrink-0 self-stretch object-cover"
        />
      ) : (
        <div className="flex w-24 flex-shrink-0 items-center justify-center self-stretch bg-slate-100 text-2xl text-slate-300">
          📍
        </div>
      )}

      <div className="min-w-0 flex-1 p-4">
        <h3 className="font-semibold text-slate-800">{place.name}</h3>

        <div className="mt-1 flex items-center gap-2">
          {visit?.rating ? <StarDisplay value={visit.rating} className="text-sm" /> : null}
          {visit?.price_level ? (
            <span className="text-sm font-medium text-green-700">
              {'$'.repeat(visit.price_level)}
            </span>
          ) : null}
        </div>

        {place.description && (
          <p className="mt-1 truncate text-sm text-slate-600">{place.description}</p>
        )}

        <p className="mt-1 text-xs text-slate-400">
          {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
        </p>
      </div>
    </button>
  )
}

export default PlaceListItem
