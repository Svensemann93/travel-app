import { describe, expect, it } from 'vitest'
import { planTripWeather } from './tripWeather'

const today = new Date('2026-07-20T12:00:00.000Z')

describe('planTripWeather', () => {
  it('shows current weather for an ongoing trip', () => {
    expect(planTripWeather('2026-07-15', '2026-07-25', today)).toEqual({ kind: 'current' })
  })

  it('shows nothing for a completed trip', () => {
    expect(planTripWeather('2026-06-01', '2026-06-10', today)).toEqual({ kind: 'none' })
  })

  it('shows nothing for a trip with no dates', () => {
    expect(planTripWeather(null, null, today)).toEqual({ kind: 'none' })
  })

  it('shows a forecast for an upcoming trip within 14 days', () => {
    expect(planTripWeather('2026-07-27', '2026-07-29', today)).toEqual({
      kind: 'forecast',
      start: '2026-07-27',
      end: '2026-07-29',
    })
  })

  it('shows nothing for an upcoming trip beyond 14 days', () => {
    expect(planTripWeather('2026-08-10', '2026-08-15', today)).toEqual({ kind: 'none' })
  })

  it('clamps a forecast end to the 14-day horizon', () => {
    expect(planTripWeather('2026-07-25', '2026-08-30', today)).toEqual({
      kind: 'forecast',
      start: '2026-07-25',
      end: '2026-08-03',
    })
  })

  it('treats an upcoming trip with only a start date as a single-day forecast', () => {
    expect(planTripWeather('2026-07-26', null, today)).toEqual({
      kind: 'forecast',
      start: '2026-07-26',
      end: '2026-07-26',
    })
  })
})
