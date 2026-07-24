import { describe, expect, it } from 'vitest'
import { toLocalIso, todayIso } from './localDate'

describe('toLocalIso', () => {
  it('reads the local calendar day even when UTC is still on the day before', () => {
    expect(toLocalIso(new Date('2026-07-24T22:30:00Z'))).toBe('2026-07-25')
  })

  it('reads the local calendar day in winter, when the offset is smaller', () => {
    expect(toLocalIso(new Date('2026-01-14T23:30:00Z'))).toBe('2026-01-15')
  })

  it('stays on the same day when local time is just before midnight', () => {
    expect(toLocalIso(new Date('2026-07-25T21:45:00Z'))).toBe('2026-07-25')
  })

  it('pads month and day to two digits', () => {
    expect(toLocalIso(new Date('2026-01-05T12:00:00Z'))).toBe('2026-01-05')
  })

  it('handles the turn of the year', () => {
    expect(toLocalIso(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01')
  })
})

describe('todayIso', () => {
  it('matches the local calendar day', () => {
    expect(todayIso()).toBe(toLocalIso(new Date()))
  })
})
