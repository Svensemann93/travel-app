import type { TripPlaceWithPlace } from '../types/trip'

export const UNPLANNED = 'unplanned'

const DAY_MS = 86_400_000
const MAX_DAYS = 366

export function tripDays(start: string | null, end: string | null): string[] {
  if (!start || !end) return []
  const from = Date.parse(`${start}T00:00:00Z`)
  const to = Date.parse(`${end}T00:00:00Z`)
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return []

  const days: string[] = []
  for (let time = from; time <= to && days.length < MAX_DAYS; time += DAY_MS) {
    days.push(new Date(time).toISOString().slice(0, 10))
  }
  return days
}

export type DayGroup = {
  id: string
  date: string | null
  places: TripPlaceWithPlace[]
}

export function groupByDay(tripPlaces: TripPlaceWithPlace[], days: string[]): DayGroup[] {
  const known = new Set(days)
  const groups: DayGroup[] = days.map((date) => ({ id: date, date, places: [] }))
  const unplanned: DayGroup = { id: UNPLANNED, date: null, places: [] }
  const byId = new Map(groups.map((group) => [group.id, group]))

  for (const tripPlace of tripPlaces) {
    const date = tripPlace.planned_date
    const target = date && known.has(date) ? byId.get(date) : undefined
    if (target) target.places.push(tripPlace)
    else unplanned.places.push(tripPlace)
  }

  return [...groups, unplanned]
}

export function flattenIds(groups: DayGroup[]): string[] {
  return groups.flatMap((group) => group.places.map((tp) => tp.place_id))
}

export function signature(groups: DayGroup[]): string {
  return groups
    .map((group) => `${group.id}:${group.places.map((tp) => tp.place_id).join(',')}`)
    .join('|')
}

export function applyMove(
  groups: DayGroup[],
  placeId: string,
  targetId: string,
  overPlaceId: string | null,
): DayGroup[] | null {
  const source = groups.find((group) => group.places.some((tp) => tp.place_id === placeId))
  const moving = source?.places.find((tp) => tp.place_id === placeId)
  const original = groups.find((group) => group.id === targetId)
  if (!moving || !original) return null

  const overIndex = overPlaceId
    ? original.places.findIndex((tp) => tp.place_id === overPlaceId)
    : -1

  const next = groups.map((group) => ({
    ...group,
    places: group.places.filter((tp) => tp.place_id !== placeId),
  }))
  const destination = next.find((group) => group.id === targetId)
  if (!destination) return null

  const insertAt =
    overIndex === -1 ? destination.places.length : Math.min(overIndex, destination.places.length)
  destination.places.splice(insertAt, 0, { ...moving, planned_date: destination.date })

  return next
}
