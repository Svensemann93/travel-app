import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import TripDaySection from './TripDaySection'
import TripPlaceItem from './TripPlaceItem'
import { useReorderTripPlaces, useUpdateTripPlace } from '../hooks/useTrips'
import { applyMove, flattenIds, groupByDay, signature, tripDays } from '../lib/tripDays'
import type { TripPlaceWithPlace } from '../types/trip'

type Props = {
  tripId: string
  startDate: string | null
  endDate: string | null
  tripPlaces: TripPlaceWithPlace[]
  removingPlaceId: string | null
  onSelectPlace: (placeId: string) => void
  onEditPlace: (tripPlace: TripPlaceWithPlace) => void
  onRemovePlace: (placeId: string) => void
}

function TripDayList({
  tripId,
  startDate,
  endDate,
  tripPlaces,
  removingPlaceId,
  onSelectPlace,
  onEditPlace,
  onRemovePlace,
}: Props) {
  const reorderTripPlaces = useReorderTripPlaces()
  const updateTripPlace = useUpdateTripPlace()
  const [activeId, setActiveId] = useState<string | null>(null)

  const days = tripDays(startDate, endDate)
  const groups = groupByDay(tripPlaces, days)
  const numbers = new Map(flattenIds(groups).map((placeId, index) => [placeId, index + 1]))
  const activePlace = tripPlaces.find((tp) => tp.place_id === activeId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const placeId = String(active.id)
    const overId = String(over.id)
    const isContainer = groups.some((group) => group.id === overId)
    const targetId = isContainer
      ? overId
      : groups.find((group) => group.places.some((tp) => tp.place_id === overId))?.id
    if (!targetId) return

    const next = applyMove(groups, placeId, targetId, isContainer ? null : overId)
    if (!next || signature(next) === signature(groups)) return

    const group = next.find((g) => g.places.some((tp) => tp.place_id === placeId))
    const current = tripPlaces.find((tp) => tp.place_id === placeId)
    if (!group || !current) return

    reorderTripPlaces.mutate({ tripId, orderedPlaceIds: flattenIds(next) })
    if ((current.planned_date ?? null) !== group.date) {
      updateTripPlace.mutate({
        tripId,
        placeId,
        data: { planned_date: group.date, notes: current.notes },
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-3">
        {groups.map((group, index) => (
          <TripDaySection
            key={group.id}
            group={group}
            dayNumber={group.date ? index + 1 : null}
            numberOf={(placeId) => numbers.get(placeId) ?? 0}
            removingPlaceId={removingPlaceId}
            onSelectPlace={onSelectPlace}
            onEditPlace={onEditPlace}
            onRemovePlace={onRemovePlace}
          />
        ))}
      </div>

      <DragOverlay>
        {activePlace ? (
          <TripPlaceItem
            place={activePlace.place}
            number={numbers.get(activePlace.place_id)}
            notes={activePlace.notes}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default TripDayList
