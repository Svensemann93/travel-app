import { describe, expect, it } from 'vitest'
import { tripStatus } from './tripStatus'

const today = new Date('2026-07-20T12:00:00.000Z')

describe('tripStatus', () => {
  it('is planning when there are no dates', () => {
    expect(tripStatus(null, null, today)).toBe('planning')
  })

  it('is completed when the end date is in the past', () => {
    expect(tripStatus('2026-06-01', '2026-06-10', today)).toBe('completed')
  })

  it('is upcoming when the start date is in the future', () => {
    expect(tripStatus('2026-08-01', '2026-08-10', today)).toBe('upcoming')
  })

  it('is ongoing when today falls within the range', () => {
    expect(tripStatus('2026-07-15', '2026-07-25', today)).toBe('ongoing')
  })

  it('treats the end day itself as still ongoing, not completed', () => {
    expect(tripStatus('2026-07-10', '2026-07-20', today)).toBe('ongoing')
  })

  it('treats the start day itself as ongoing, not upcoming', () => {
    expect(tripStatus('2026-07-20', '2026-07-30', today)).toBe('ongoing')
  })

  it('is ongoing with only a past start and no end', () => {
    expect(tripStatus('2026-07-01', null, today)).toBe('ongoing')
  })

  it('is upcoming with only a future start and no end', () => {
    expect(tripStatus('2026-09-01', null, today)).toBe('upcoming')
  })

  it('is completed with only a past end and no start', () => {
    expect(tripStatus(null, '2026-07-01', today)).toBe('completed')
  })
})
