import { describe, expect, it } from 'vitest'
import { fallbackCoverPath } from './tripCoverFallback'
import { STANDARD_COVERS } from './tripCovers'

describe('fallbackCoverPath', () => {
  it('returns one of the standard covers', () => {
    const paths = STANDARD_COVERS.map((c) => c.path)
    expect(paths).toContain(fallbackCoverPath('some-trip-id'))
  })

  it('is stable for the same id', () => {
    expect(fallbackCoverPath('abc-123')).toBe(fallbackCoverPath('abc-123'))
  })

  it('spreads different ids across more than one cover', () => {
    const chosen = new Set(Array.from({ length: 50 }, (_, i) => fallbackCoverPath(`trip-${i}`)))
    expect(chosen.size).toBeGreaterThan(1)
  })
})
