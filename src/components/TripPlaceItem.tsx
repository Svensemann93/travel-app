import type { HTMLAttributes } from 'react'
import type { Place } from '../types/place'
import DragHandle from './DragHandle'
import SignedImage from './SignedImage'
import TripPlaceItemActions from './TripPlaceItemActions'
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
      className={`rounded-lg bg-white p-3 shadow-sm ${
        isDragging ? 'shadow-lg ring-2 ring-blue-200' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {dragHandleProps && <DragHandle handleProps={dragHandleProps} />}
        {number !== undefined && (
          <div
            aria-hidden="true"
            className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
          >
            {number}
          </div>
        )}
        {firstPhoto && (
          <SignedImage
            path={firstPhoto.thumb_url ?? firstPhoto.url}
            alt={place.name}
            className="h-14 w-14 flex-shrink-0 rounded object-cover"
          />
        )}
        <button
          type="button"
          onClick={onSelect}
          disabled={!onSelect}
          className="min-w-0 flex-1 text-left disabled:cursor-default"
        >
          <h4 className="truncate font-medium text-slate-800">{place.name}</h4>
          {place.description && (
            <p className="line-clamp-1 text-sm text-slate-500">{place.description}</p>
          )}
          {hasDetails && (
            <div className="mt-1 space-y-0.5">
              {formattedDate && <p className="text-sm text-blue-700">📅 {formattedDate}</p>}
              {notes && <p className="line-clamp-2 text-sm italic text-slate-600">{notes}</p>}
            </div>
          )}
        </button>
        <TripPlaceItemActions
          onEdit={onEdit}
          onRemove={onRemove}
          isRemoving={isRemoving}
          className="hidden flex-shrink-0 flex-col gap-1 sm:flex"
        />
      </div>
      <TripPlaceItemActions
        onEdit={onEdit}
        onRemove={onRemove}
        isRemoving={isRemoving}
        className="mt-2 flex justify-end gap-4 sm:hidden"
      />
    </div>
  )
}

export default TripPlaceItem
