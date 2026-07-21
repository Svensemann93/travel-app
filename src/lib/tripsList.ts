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

export function completedLast(trips: TripListItem[], today: Date = new Date()): TripListItem[] {
  const active: TripListItem[] = []
  const done: TripListItem[] = []
  for (const trip of trips) {
    if (tripStatus(trip.start_date, trip.end_date, today) === 'completed') done.push(trip)
    else active.push(trip)
  }
  return [...active, ...done]
}

export function sortTripsByStatus(
  trips: TripListItem[],
  direction: 'asc' | 'desc',
  today: Date = new Date(),
): TripListItem[] {
  const rank = (trip: TripListItem) =>
    STATUS_ORDER[tripStatus(trip.start_date, trip.end_date, today)]
  const sorted = [...trips].sort((a, b) => {
    const diff = rank(a) - rank(b)
    return direction === 'asc' ? diff : -diff
  })
  return sorted
}
