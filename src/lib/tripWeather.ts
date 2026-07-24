import { tripStatus } from './tripStatus'
import { toLocalIso } from './localDate'

const FORECAST_HORIZON_DAYS = 14

export type TripWeatherPlan =
  | { kind: 'none' }
  | { kind: 'ongoing'; start: string; end: string }
  | { kind: 'upcoming'; start: string; end: string }

function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()
  return Math.round(ms / 86_400_000)
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function clampEnd(rawEnd: string, today: Date): string {
  const maxEnd = addDaysIso(toLocalIso(today), FORECAST_HORIZON_DAYS)
  return rawEnd < maxEnd ? rawEnd : maxEnd
}

export function planTripWeather(
  startDate: string | null,
  endDate: string | null,
  today: Date = new Date(),
): TripWeatherPlan {
  const status = tripStatus(startDate, endDate, today)
  if (status === 'completed' || status === 'planning') return { kind: 'none' }

  const now = toLocalIso(today)

  if (status === 'ongoing') {
    return { kind: 'ongoing', start: now, end: clampEnd(endDate ?? now, today) }
  }

  const start = startDate!
  if (daysBetween(now, start) > FORECAST_HORIZON_DAYS) return { kind: 'none' }
  return { kind: 'upcoming', start, end: clampEnd(endDate ?? start, today) }
}
