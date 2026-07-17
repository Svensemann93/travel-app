import { describe, expect, it } from 'vitest'
import { publicMarkerVariant } from './publicMarkers'
import type { PublicPlace } from '../types/place'

function place(overrides: Partial<PublicPlace> = {}): PublicPlace {
  return {
    id: 'public-1',
    name: 'Bockmattlipass',
    description: null,
    latitude: 47.05,
    longitude: 8.95,
    category: 'hiking',
    website_url: null,
    username: 'testuser',
    country_code: 'CH',
    photos: [],
    avg_rating: null,
    avg_price: null,
    visit_count: 0,
    my_rating: null,
    my_price: null,
    my_visited_on: null,
    visited_by_me: false,
    wished_by_me: false,
    ...overrides,
  }
}

describe('publicMarkerVariant', () => {
  it('is plain for a place you neither visited nor wished for', () => {
    expect(publicMarkerVariant(place())).toBe('plain')
  })

  it('is wished once you put it on the wishlist', () => {
    expect(publicMarkerVariant(place({ wished_by_me: true }))).toBe('wished')
  })

  it('is visited once you have been there', () => {
    expect(publicMarkerVariant(place({ visited_by_me: true }))).toBe('visited')
  })

  it('lets having been there win over still wishing for it', () => {
    expect(publicMarkerVariant(place({ visited_by_me: true, wished_by_me: true }))).toBe('visited')
  })
})
