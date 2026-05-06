import SignedImage from './SignedImage'
import type { Place } from '../types/place'

type Props = {
  place: Place
  onSelect?: () => void
  onRemove?: () => void
  isRemoving?: boolean
}

function TripPlaceItem({ place, onSelect, onRemove, isRemoving }: Props) {
  const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]

  const inner = (
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
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          disabled={isRemoving}
          aria-label="Aus Trip entfernen"
          className="px-4 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </div>
  )

  if (onSelect) {
    return (
      <button
        onClick={onSelect}
        className="w-full text-left hover:shadow-md transition-shadow rounded-lg block"
      >
        {inner}
      </button>
    )
  }
  return inner
}

export default TripPlaceItem
