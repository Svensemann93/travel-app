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
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import TripDaySection from './TripDaySection'
import TripPlaceItem from './TripPlaceItem'
import { useMoveTripPlace } from '../hooks/useTrips'
import {
  UNPLANNED,
  applyMove,
  displayOrder,
  flattenIds,
  groupByDay,
  signature,
  tripDays,
} from '../lib/tripDays'
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
  const moveTripPlace = useMoveTripPlace()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overGroupId, setOverGroupId] = useState<string | null>(null)
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({})

  const days = tripDays(startDate, endDate)
  const groups = groupByDay(tripPlaces, days)
  const numbers = new Map(flattenIds(groups).map((placeId, index) => [placeId, index + 1]))
  const activePlace = tripPlaces.find((tp) => tp.place_id === activeId) ?? null
  const today = new Date().toISOString().slice(0, 10)

  function isOpen(group: (typeof groups)[number]): boolean {
    return openOverrides[group.id] ?? (group.id === UNPLANNED || group.places.length > 0)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function groupIdOf(overId: string): string | null {
    if (groups.some((group) => group.id === overId)) return overId
    return groups.find((group) => group.places.some((tp) => tp.place_id === overId))?.id ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    setOverGroupId(event.over ? groupIdOf(String(event.over.id)) : null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    setOverGroupId(null)
    const { active, over } = event
    if (!over) return

    const placeId = String(active.id)
    const overId = String(over.id)
    const isContainer = groups.some((group) => group.id === overId)
    const targetId = groupIdOf(overId)
    if (!targetId) return

    const next = applyMove(groups, placeId, targetId, isContainer ? null : overId)
    if (!next || signature(next) === signature(groups)) return

    const group = next.find((g) => g.places.some((tp) => tp.place_id === placeId))
    const current = tripPlaces.find((tp) => tp.place_id === placeId)
    if (!group || !current) return

    setOpenOverrides((value) => ({ ...value, [group.id]: true }))
    moveTripPlace.mutate({
      tripId,
      placeId,
      plannedDate: group.date,
      notes: current.notes,
      orderedPlaceIds: flattenIds(next),
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null)
        setOverGroupId(null)
      }}
    >
      <div className="space-y-3">
        {displayOrder(groups).map((group) => (
          <TripDaySection
            key={group.id}
            group={group}
            isTarget={overGroupId === group.id}
            isToday={group.date === today}
            isOpen={isOpen(group)}
            onToggle={() => setOpenOverrides((value) => ({ ...value, [group.id]: !isOpen(group) }))}
            dayNumber={group.date ? days.indexOf(group.date) + 1 : null}
            numberOf={(placeId) => numbers.get(placeId) ?? 0}
            removingPlaceId={removingPlaceId}
            onSelectPlace={onSelectPlace}
            onEditPlace={onEditPlace}
            onRemovePlace={onRemovePlace}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
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
