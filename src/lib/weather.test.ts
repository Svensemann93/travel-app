import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchForecast, weatherKind } from './weather'

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

describe('fetchForecast', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses daily fields including precipitation and wind', async () => {
    const payload = {
      daily: {
        time: ['2026-07-20', '2026-07-21'],
        temperature_2m_max: [24.4, 19.6],
        temperature_2m_min: [16.5, 13.2],
        weather_code: [1, 61],
        precipitation_probability_max: [10, 80],
        wind_speed_10m_max: [12.3, 20.7],
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }))

    const result = await fetchForecast(1, 2, '2026-07-20', '2026-07-21')

    expect(result).toEqual([
      {
        date: '2026-07-20',
        tempMax: 24,
        tempMin: 17,
        weatherCode: 1,
        precipitationProbability: 10,
        windMax: 12.3,
      },
      {
        date: '2026-07-21',
        tempMax: 20,
        tempMin: 13,
        weatherCode: 61,
        precipitationProbability: 80,
        windMax: 20.7,
      },
    ])
  })

  it('falls back to null precipitation and zero wind when missing', async () => {
    const payload = {
      daily: {
        time: ['2026-07-20'],
        temperature_2m_max: [24],
        temperature_2m_min: [16],
        weather_code: [1],
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }))

    const result = await fetchForecast(1, 2, '2026-07-20', '2026-07-20')

    expect(result[0].precipitationProbability).toBeNull()
    expect(result[0].windMax).toBe(0)
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(fetchForecast(1, 2, '2026-07-20', '2026-07-20')).rejects.toThrow()
  })
})
