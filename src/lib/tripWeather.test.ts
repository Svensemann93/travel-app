import { describe, expect, it } from 'vitest'
import { planTripWeather } from './tripWeather'

const today = new Date('2026-07-20T12:00:00.000Z')

describe('planTripWeather', () => {
  it('plans an ongoing trip from today to its end date', () => {
    expect(planTripWeather('2026-07-15', '2026-07-25', today)).toEqual({
      kind: 'ongoing',
      start: '2026-07-20',
      end: '2026-07-25',
    })
  })

  it('clamps an ongoing trip end to the 14-day horizon', () => {
    expect(planTripWeather('2026-07-15', '2026-08-30', today)).toEqual({
      kind: 'ongoing',
      start: '2026-07-20',
      end: '2026-08-03',
    })
  })

  it('plans an ongoing trip without an end date as a single day', () => {
    expect(planTripWeather('2026-07-15', null, today)).toEqual({
      kind: 'ongoing',
      start: '2026-07-20',
      end: '2026-07-20',
    })
  })

  it('shows nothing for a completed trip', () => {
    expect(planTripWeather('2026-06-01', '2026-06-10', today)).toEqual({ kind: 'none' })
  })

  it('shows nothing for a trip with no dates', () => {
    expect(planTripWeather(null, null, today)).toEqual({ kind: 'none' })
  })

  it('plans a forecast for an upcoming trip within 14 days', () => {
    expect(planTripWeather('2026-07-27', '2026-07-29', today)).toEqual({
      kind: 'upcoming',
      start: '2026-07-27',
      end: '2026-07-29',
    })
  })

  it('shows nothing for an upcoming trip beyond 14 days', () => {
    expect(planTripWeather('2026-08-10', '2026-08-15', today)).toEqual({ kind: 'none' })
  })

  it('clamps an upcoming trip end to the 14-day horizon', () => {
    expect(planTripWeather('2026-07-25', '2026-08-30', today)).toEqual({
      kind: 'upcoming',
      start: '2026-07-25',
      end: '2026-08-03',
    })
  })

  it('treats an upcoming trip with only a start date as a single day', () => {
    expect(planTripWeather('2026-07-26', null, today)).toEqual({
      kind: 'upcoming',
      start: '2026-07-26',
      end: '2026-07-26',
    })
  })
})
