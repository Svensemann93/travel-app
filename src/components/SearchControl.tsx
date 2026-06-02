import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import './SearchControl.css'

function SearchControl() {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider()

    // @ts-expect-error GeoSearchControl lacks a TS construct signature in leaflet-geosearch
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      keepResult: false,
      retainZoomLevel: false,
      searchLabel: 'Ort suchen …',
      notFoundMessage: 'Kein Ort gefunden.',
    })

    map.addControl(searchControl)
    return () => {
      map.removeControl(searchControl)
    }
  }, [map])

  return null
}

export default SearchControl
