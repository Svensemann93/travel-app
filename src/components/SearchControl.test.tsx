import { render } from '@testing-library/react'
import SearchControl from './SearchControl'

type GeoSearchConfig = {
  style: string
  showMarker: boolean
  searchLabel: string
  notFoundMessage: string
}

const { geoSearch, provider, mapApi, instance, originalSubmit } = vi.hoisted(() => {
  const originalSubmit = vi.fn()
  const instance = {
    onSubmit: originalSubmit,
    showResult: vi.fn(),
    resultList: { clear: vi.fn() },
  }
  return {
    geoSearch: vi.fn(function (config: GeoSearchConfig) {
      void config
      return instance
    }),
    provider: vi.fn(),
    mapApi: { addControl: vi.fn(), removeControl: vi.fn() },
    instance,
    originalSubmit,
  }
})

vi.mock('react-leaflet', () => ({
  useMap: () => mapApi,
}))

vi.mock('leaflet-geosearch', () => ({
  GeoSearchControl: geoSearch,
  OpenStreetMapProvider: provider,
}))

beforeEach(() => {
  vi.clearAllMocks()
  instance.onSubmit = originalSubmit
})

describe('SearchControl', () => {
  it('adds a geosearch control to the map on mount', () => {
    render(<SearchControl />)
    expect(geoSearch).toHaveBeenCalledTimes(1)
    expect(mapApi.addControl).toHaveBeenCalledTimes(1)
  })

  it('configures the bar style and search labels', () => {
    render(<SearchControl />)
    const config = geoSearch.mock.calls[0][0]
    expect(config.style).toBe('bar')
    expect(config.showMarker).toBe(false)
    expect(typeof config.searchLabel).toBe('string')
    expect(config.searchLabel.length).toBeGreaterThan(0)
    expect(typeof config.notFoundMessage).toBe('string')
    expect(config.notFoundMessage.length).toBeGreaterThan(0)
  })

  it('removes the control again on unmount', () => {
    const { unmount } = render(<SearchControl />)
    unmount()
    expect(mapApi.removeControl).toHaveBeenCalledTimes(1)
  })

  it('shows a picked suggestion directly instead of searching for its label again', () => {
    render(<SearchControl />)
    const result = { x: 8.8, y: 47.2, label: 'Siebnen, Schwyz, Schweiz' }

    instance.onSubmit({ query: result.label, data: result })

    expect(instance.showResult).toHaveBeenCalledWith(result, {
      query: result.label,
      data: result,
    })
    expect(instance.resultList.clear).toHaveBeenCalledTimes(1)
    expect(originalSubmit).not.toHaveBeenCalled()
  })

  it('still runs a normal search when the query has no suggestion data', () => {
    render(<SearchControl />)

    instance.onSubmit({ query: 'Siebnen' })

    expect(originalSubmit).toHaveBeenCalledWith({ query: 'Siebnen' })
    expect(instance.showResult).not.toHaveBeenCalled()
  })
})
