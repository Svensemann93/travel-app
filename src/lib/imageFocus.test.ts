import { describe, expect, it } from 'vitest'
import { clampFocus } from './imageFocus'

describe('clampFocus', () => {
  it('floors values below zero to zero', () => {
    expect(clampFocus(-20)).toBe(0)
  })

  it('caps values above one hundred', () => {
    expect(clampFocus(140)).toBe(100)
  })

  it('rounds values within range', () => {
    expect(clampFocus(49.6)).toBe(50)
  })

  it('keeps the bounds', () => {
    expect(clampFocus(0)).toBe(0)
    expect(clampFocus(100)).toBe(100)
  })
})
