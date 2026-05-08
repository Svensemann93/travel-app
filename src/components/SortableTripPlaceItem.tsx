import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Place } from '../types/place'
import TripPlaceItem from './TripPlaceItem'

type Props = {
  id: string
  place: Place
  number?: number
  plannedDate?: string | null
  notes?: string | null
  onSelect: () => void
  onEdit: () => void
  onRemove: () => void
  isRemoving: boolean
}

function SortableTripPlaceItem({
  id,
  place,
  number,
  plannedDate,
  notes,
  onSelect,
  onEdit,
  onRemove,
  isRemoving,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TripPlaceItem
        place={place}
        number={number}
        plannedDate={plannedDate}
        notes={notes}
        onSelect={onSelect}
        onEdit={onEdit}
        onRemove={onRemove}
        isRemoving={isRemoving}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

export default SortableTripPlaceItem
