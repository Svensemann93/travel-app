import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableTripPlaceItem from './SortableTripPlaceItem'
import { useReorderTripPlaces } from '../hooks/useTrips'
import type { TripPlaceWithPlace } from '../types/trip'

type Props = {
  tripId: string
  tripPlaces: TripPlaceWithPlace[]
  removingPlaceId: string | null
  onSelectPlace: (placeId: string) => void
  onEditPlace: (tripPlace: TripPlaceWithPlace) => void
  onRemovePlace: (placeId: string) => void
}

function TripPlaceList({
  tripId,
  tripPlaces,
  removingPlaceId,
  onSelectPlace,
  onEditPlace,
  onRemovePlace,
}: Props) {
  const reorderTripPlaces = useReorderTripPlaces()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tripPlaces.findIndex((tp) => tp.place_id === active.id)
    const newIndex = tripPlaces.findIndex((tp) => tp.place_id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(tripPlaces, oldIndex, newIndex)
    const orderedPlaceIds = newOrder.map((tp) => tp.place_id)

    reorderTripPlaces.mutate({ tripId, orderedPlaceIds })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={tripPlaces.map((tp) => tp.place_id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-4">
          {tripPlaces.map((tp, index) => (
            <li key={tp.place_id}>
              <SortableTripPlaceItem
                id={tp.place_id}
                place={tp.place}
                number={index + 1}
                plannedDate={tp.planned_date}
                notes={tp.notes}
                onSelect={() => onSelectPlace(tp.place_id)}
                onEdit={() => onEditPlace(tp)}
                onRemove={() => onRemovePlace(tp.place_id)}
                isRemoving={removingPlaceId === tp.place_id}
              />
            </li>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

export default TripPlaceList
