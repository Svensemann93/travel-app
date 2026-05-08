import type { HTMLAttributes } from 'react'
import type { Place } from '../types/place'
import SignedImage from './SignedImage'
import { formatDate } from '../lib/dateFormat'

type Props = {
  place: Place
  number?: number
  plannedDate?: string | null
  notes?: string | null
  onSelect?: () => void
  onEdit?: () => void
  onRemove?: () => void
  isRemoving?: boolean
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
  isDragging?: boolean
}

function TripPlaceItem({
  place,
  number,
  plannedDate,
  notes,
  onSelect,
  onEdit,
  onRemove,
  isRemoving,
  dragHandleProps,
  isDragging,
}: Props) {
  const firstPhoto = place.photos?.slice().sort((a, b) => a.position - b.position)[0]
  const formattedDate = plannedDate ? formatDate(plannedDate) : null
  const hasDetails = formattedDate || notes

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-3 flex gap-3 items-start ${
        isDragging ? 'shadow-lg ring-2 ring-blue-200' : ''
      }`}
    >
      {dragHandleProps && (
        <button
          type="button"
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          aria-label="Reihenfolge ändern"
          className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing flex-shrink-0 p-1 touch-none mt-1"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="6" cy="3" r="1.5" />
            <circle cx="10" cy="3" r="1.5" />
            <circle cx="6" cy="8" r="1.5" />
            <circle cx="10" cy="8" r="1.5" />
            <circle cx="6" cy="13" r="1.5" />
            <circle cx="10" cy="13" r="1.5" />
          </svg>
        </button>
      )}

      {number !== undefined && (
        <div
          aria-hidden="true"
          className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 mt-1"
        >
          {number}
        </div>
      )}

      {firstPhoto && (
        <SignedImage
          path={firstPhoto.thumb_url ?? firstPhoto.url}
          alt={place.name}
          className="h-14 w-14 object-cover rounded flex-shrink-0"
        />
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={!onSelect}
        className="flex-1 text-left disabled:cursor-default min-w-0"
      >
        <h4 className="font-medium text-slate-800 truncate">{place.name}</h4>
        {place.description && (
          <p className="text-sm text-slate-500 line-clamp-1">{place.description}</p>
        )}
        {hasDetails && (
          <div className="mt-1 space-y-0.5">
            {formattedDate && <p className="text-sm text-blue-700">📅 {formattedDate}</p>}
            {notes && <p className="text-sm text-slate-600 italic line-clamp-2">{notes}</p>}
          </div>
        )}
      </button>

      <div className="flex flex-col gap-1 flex-shrink-0">
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-sm text-blue-600 hover:underline">
            Bearbeiten
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {isRemoving ? '…' : 'Entfernen'}
          </button>
        )}
      </div>
    </div>
  )
}

export default TripPlaceItem
