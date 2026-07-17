import { describe, expect, it } from 'vitest'
import { parseFocusPoint } from './focusPoint'

describe('parseFocusPoint', () => {
  it('reads a coordinate pair', () => {
    expect(parseFocusPoint('47.05', '8.95')).toEqual({ latitude: 47.05, longitude: 8.95 })
  })

  it('is null when a parameter is missing', () => {
    expect(parseFocusPoint('47.05', null)).toBeNull()
    expect(parseFocusPoint(null, '8.95')).toBeNull()
  })

  it('is null for values that are not numbers', () => {
    expect(parseFocusPoint('somewhere', '8.95')).toBeNull()
  })

  it('is null outside the coordinate range', () => {
    expect(parseFocusPoint('91', '8.95')).toBeNull()
    expect(parseFocusPoint('47.05', '181')).toBeNull()
  })

  it('reads a zero coordinate rather than treating it as empty', () => {
    expect(parseFocusPoint('0', '0')).toEqual({ latitude: 0, longitude: 0 })
  })
})
