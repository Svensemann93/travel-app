import { describe, expect, it } from 'vitest'
import { toLocalIso, todayIso } from './localDate'

describe('toLocalIso', () => {
  it('reads the calendar day the clock shows, not the UTC one', () => {
    const justAfterMidnight = new Date(2026, 6, 25, 0, 30)
    expect(toLocalIso(justAfterMidnight)).toBe('2026-07-25')
  })

  it('reads the calendar day just before midnight', () => {
    expect(toLocalIso(new Date(2026, 6, 25, 23, 45))).toBe('2026-07-25')
  })

  it('pads month and day to two digits', () => {
    expect(toLocalIso(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05')
  })

  it('handles the last day of a year', () => {
    expect(toLocalIso(new Date(2026, 11, 31, 22, 0))).toBe('2026-12-31')
  })
})

describe('todayIso', () => {
  it('matches the local calendar day', () => {
    expect(todayIso()).toBe(toLocalIso(new Date()))
  })
})
