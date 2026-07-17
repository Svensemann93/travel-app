import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import StarDisplay from './StarDisplay'
import { visitOf } from '../lib/placeVisits'
import type { Place } from '../types/place'

type Props = {
  place: Place
  onClick: (placeId: string) => void
}

function PlaceListItem({ place, onClick }: Props) {
  const { t } = useTranslation('places')
  const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]
  const visit = visitOf(place)

  return (
    <button
      onClick={() => onClick(place.id)}
      className="w-full text-left bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex"
    >
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
        <h3 className="font-semibold text-slate-800">{place.name}</h3>

        <div className="flex items-center gap-2 mt-1">
          {visit ? null : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {t('planned')}
            </span>
          )}
          {visit?.rating ? <StarDisplay value={visit.rating} className="text-sm" /> : null}
          {visit?.price_level ? (
            <span className="text-sm font-medium text-green-700">
              {'$'.repeat(visit.price_level)}
            </span>
          ) : null}
        </div>

        {place.description && (
          <p className="text-sm text-slate-600 mt-1 truncate">{place.description}</p>
        )}

        <p className="text-xs text-slate-400 mt-1">
          {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
        </p>
      </div>
    </button>
  )
}

export default PlaceListItem
