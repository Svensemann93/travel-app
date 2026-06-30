import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import './SearchControl.css'

function SearchControl() {
  const map = useMap()
  const { t, i18n } = useTranslation('map')

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
      searchLabel: t('search.label'),
      notFoundMessage: t('search.notFound'),
    })

    map.addControl(searchControl)
    return () => {
      map.removeControl(searchControl)
    }
  }, [map, t, i18n.language])

  return null
}

export default SearchControl
