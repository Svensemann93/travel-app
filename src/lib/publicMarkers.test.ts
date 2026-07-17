import { describe, expect, it } from 'vitest'
import { publicMarkerVariant } from './publicMarkers'
import { makePublicPlace } from '../test/fixtures'

describe('publicMarkerVariant', () => {
  it('is plain for a place you neither visited nor wished for', () => {
    expect(publicMarkerVariant(makePublicPlace({ wished_by_me: false }))).toBe('plain')
  })

  it('is wished once you put it on the wishlist', () => {
    expect(publicMarkerVariant(makePublicPlace({ wished_by_me: true }))).toBe('wished')
  })

  it('is visited once you have been there', () => {
    expect(publicMarkerVariant(makePublicPlace({ visited_by_me: true, wished_by_me: false }))).toBe(
      'visited',
    )
  })

  it('lets having been there win over still wishing for it', () => {
    expect(publicMarkerVariant(makePublicPlace({ visited_by_me: true, wished_by_me: true }))).toBe(
      'visited',
    )
  })
})
