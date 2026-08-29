import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import './SearchControl.css'

type SearchResult = { x: number; y: number; label: string }

type SubmitArgs = { query: string; data?: SearchResult }

type SearchControlInstance = {
  onSubmit?: (args: SubmitArgs) => Promise<void> | void
  showResult?: (result: SearchResult, args: SubmitArgs) => void
  resultList?: { clear: () => void }
}

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

    const control = searchControl as unknown as SearchControlInstance
    const submit = control.onSubmit
    const showResult = control.showResult

    if (submit && showResult) {
      control.onSubmit = (args: SubmitArgs) => {
        if (!args.data) return submit.call(control, args)
        control.resultList?.clear()
        showResult.call(control, args.data, args)
      }
    }

    map.addControl(searchControl)
    return () => {
      map.removeControl(searchControl)
    }
  }, [map, t, i18n.language])

  return null
}

export default SearchControl
