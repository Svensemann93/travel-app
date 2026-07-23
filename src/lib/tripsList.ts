import { tripStatus } from './tripStatus'
import type { TripStatus } from './tripStatus'
import type { TripListItem } from '../types/trip'

const STATUS_ORDER: Record<TripStatus, number> = {
  completed: 0,
  planning: 1,
  upcoming: 2,
  ongoing: 3,
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function searchTrips(trips: TripListItem[], query: string): TripListItem[] {
  const needle = fold(query.trim())
  if (!needle) return trips
  return trips.filter((trip) => fold(trip.name).includes(needle))
}

export function hideCompletedTrips(
  trips: TripListItem[],
  hide: boolean,
  today: Date = new Date(),
): TripListItem[] {
  if (!hide) return trips
  return trips.filter((trip) => tripStatus(trip.start_date, trip.end_date, today) !== 'completed')
}

function compareActive(a: TripListItem, b: TripListItem): number {
  const left = a.start_date ?? a.end_date ?? ''
  const right = b.start_date ?? b.end_date ?? ''
  if (!left && !right) return a.name.localeCompare(b.name)
  if (!left) return 1
  if (!right) return -1
  return left.localeCompare(right) || a.name.localeCompare(b.name)
}

function compareCompleted(a: TripListItem, b: TripListItem): number {
  const left = a.end_date ?? a.start_date ?? ''
  const right = b.end_date ?? b.start_date ?? ''
  return right.localeCompare(left) || a.name.localeCompare(b.name)
}

export function completedLast(trips: TripListItem[], today: Date = new Date()): TripListItem[] {
  const active: TripListItem[] = []
  const done: TripListItem[] = []
  for (const trip of trips) {
    if (tripStatus(trip.start_date, trip.end_date, today) === 'completed') done.push(trip)
    else active.push(trip)
  }
  active.sort(compareActive)
  done.sort(compareCompleted)
  return [...active, ...done]
}

export function sortTripsByStatus(
  trips: TripListItem[],
  direction: 'asc' | 'desc',
  today: Date = new Date(),
): TripListItem[] {
  const statusOf = (trip: TripListItem) => tripStatus(trip.start_date, trip.end_date, today)
  const sorted = [...trips].sort((a, b) => {
    const status = statusOf(a)
    const diff =
      STATUS_ORDER[status] - STATUS_ORDER[statusOf(b)] ||
      (status === 'completed' ? compareCompleted(a, b) : compareActive(a, b))
    return direction === 'asc' ? diff : -diff
  })
  return sorted
}
