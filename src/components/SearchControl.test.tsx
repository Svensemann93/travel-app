import { render } from '@testing-library/react'
import SearchControl from './SearchControl'

const { geoSearch, provider, mapApi } = vi.hoisted(() => ({
  geoSearch: vi.fn(),
  provider: vi.fn(),
  mapApi: { addControl: vi.fn(), removeControl: vi.fn() },
}))

vi.mock('react-leaflet', () => ({
  useMap: () => mapApi,
}))

vi.mock('leaflet-geosearch', () => ({
  GeoSearchControl: geoSearch,
  OpenStreetMapProvider: provider,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SearchControl', () => {
  it('adds a geosearch control to the map on mount', () => {
    render(<SearchControl />)
    expect(geoSearch).toHaveBeenCalledTimes(1)
    expect(mapApi.addControl).toHaveBeenCalledTimes(1)
  })

  it('configures the bar style and German labels', () => {
    render(<SearchControl />)
    const config = geoSearch.mock.calls[0][0]
    expect(config.style).toBe('bar')
    expect(config.showMarker).toBe(false)
    expect(config.searchLabel).toBe('Ort suchen …')
    expect(config.notFoundMessage).toBe('Kein Ort gefunden.')
  })

  it('removes the control again on unmount', () => {
    const { unmount } = render(<SearchControl />)
    unmount()
    expect(mapApi.removeControl).toHaveBeenCalledTimes(1)
  })
})
