import { tripStatus } from './tripStatus'

const FORECAST_HORIZON_DAYS = 14

export type TripWeatherPlan =
  | { kind: 'none' }
  | { kind: 'current' }
  | { kind: 'forecast'; start: string; end: string }

function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()
  return Math.round(ms / 86_400_000)
}

export function planTripWeather(
  startDate: string | null,
  endDate: string | null,
  today: Date = new Date(),
): TripWeatherPlan {
  const status = tripStatus(startDate, endDate, today)
  if (status === 'ongoing') return { kind: 'current' }
  if (status === 'completed' || status === 'planning') return { kind: 'none' }

  const now = today.toISOString().slice(0, 10)
  const start = startDate!
  const daysUntilStart = daysBetween(now, start)
  if (daysUntilStart > FORECAST_HORIZON_DAYS) return { kind: 'none' }

  const rawEnd = endDate ?? start
  const maxEnd = new Date(today.getTime() + FORECAST_HORIZON_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10)
  const end = rawEnd < maxEnd ? rawEnd : maxEnd
  return { kind: 'forecast', start, end }
}
