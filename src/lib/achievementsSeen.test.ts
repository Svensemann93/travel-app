import { afterEach, describe, expect, it } from 'vitest'
import { loadSeen, saveSeen, reconcileSeen } from './achievementsSeen'

afterEach(() => localStorage.clear())

describe('achievementsSeen storage (per user)', () => {
  it('keeps two users in the same browser isolated', () => {
    saveSeen('user-a', ['first_place', 'ten_places'])
    expect(loadSeen('user-a')).toEqual(['first_place', 'ten_places'])
    expect(loadSeen('user-b')).toBeNull()
  })

  it('returns null for a user that has never been seeded', () => {
    expect(loadSeen('fresh-user')).toBeNull()
  })

  it('persists dismissed stamps across sessions (no reappear after re-login)', () => {
    saveSeen('user-a', ['first_place', 'hiker'])
    const { fresh } = reconcileSeen(['first_place', 'hiker'], loadSeen('user-a') ?? [])
    expect(fresh).toEqual([])
  })
})

describe('reconcileSeen (monotonic)', () => {
  it('detects only newly earned stamps', () => {
    const { fresh, nextSeen } = reconcileSeen(['a', 'b'], ['a'])
    expect(fresh).toEqual(['b'])
    expect(nextSeen).toEqual(['a', 'b'])
  })

  it('never removes ids on a temporary undercount', () => {
    const { fresh, nextSeen } = reconcileSeen(['a'], ['a', 'b', 'c'])
    expect(fresh).toEqual([])
    expect(nextSeen).toEqual(['a', 'b', 'c'])
  })

  it('does not re-surface a stamp after the undercount recovers', () => {
    const first = reconcileSeen(['a'], ['a', 'b', 'c'])
    const second = reconcileSeen(['a', 'b', 'c'], first.nextSeen)
    expect(second.fresh).toEqual([])
  })

  it('keeps the same reference when nothing is new', () => {
    const seen = ['a', 'b']
    expect(reconcileSeen(['a', 'b'], seen).nextSeen).toBe(seen)
  })
})
