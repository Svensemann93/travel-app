export type TripStatus = 'planning' | 'upcoming' | 'ongoing' | 'completed'

export function tripStatus(
  startDate: string | null,
  endDate: string | null,
  today: Date = new Date(),
): TripStatus {
  if (!startDate && !endDate) return 'planning'

  const now = today.toISOString().slice(0, 10)
  if (endDate && endDate < now) return 'completed'
  if (startDate && startDate > now) return 'upcoming'
  return 'ongoing'
}
