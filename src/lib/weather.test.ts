import { describe, expect, it } from 'vitest'
import { weatherKind } from './weather'

describe('weatherKind', () => {
  it('maps clear sky', () => {
    expect(weatherKind(0)).toBe('clear')
  })

  it('maps cloud cover to cloudy', () => {
    expect(weatherKind(1)).toBe('cloudy')
    expect(weatherKind(3)).toBe('cloudy')
  })

  it('maps fog', () => {
    expect(weatherKind(45)).toBe('fog')
    expect(weatherKind(48)).toBe('fog')
  })

  it('maps drizzle and rain', () => {
    expect(weatherKind(51)).toBe('rain')
    expect(weatherKind(65)).toBe('rain')
    expect(weatherKind(80)).toBe('rain')
  })

  it('maps snow', () => {
    expect(weatherKind(71)).toBe('snow')
    expect(weatherKind(85)).toBe('snow')
  })

  it('maps thunderstorm', () => {
    expect(weatherKind(95)).toBe('storm')
    expect(weatherKind(99)).toBe('storm')
  })
})
