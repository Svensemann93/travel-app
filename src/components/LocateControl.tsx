import { useEffect, useRef, useState } from 'react'
import { Circle, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import './LocateControl.css'

type Status = 'idle' | 'locating' | 'error'
type Position = { lat: number; lng: number; accuracy: number }

const locationIcon = L.divIcon({
  className: 'locate-dot',
  html: '<span class="locate-dot__pulse"></span><span class="locate-dot__core"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function LocateControl() {
  const map = useMap()
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [position, setPosition] = useState<Position | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current)
      L.DomEvent.disableScrollPropagation(containerRef.current)
    }
  }, [])

  function handleLocate() {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setErrorMessage('Dein Browser unterstützt keine Standortbestimmung.')
      return
    }
    setStatus('locating')
    setErrorMessage('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setPosition(next)
        const bounds = L.latLng(next.lat, next.lng).toBounds(next.accuracy * 2)
        map.flyToBounds(bounds, { maxZoom: 16, padding: [50, 50] })
        setStatus('idle')
      },
      (err) => {
        setStatus('error')
        setErrorMessage(
          err.code === err.PERMISSION_DENIED
            ? 'Standortzugriff ist blockiert. Du kannst ihn in den Browser-Einstellungen erlauben.'
            : 'Dein Standort konnte nicht ermittelt werden.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <>
      {position && (
        <>
          <Circle
            center={[position.lat, position.lng]}
            radius={position.accuracy}
            interactive={false}
            pathOptions={{ color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.12 }}
          />
          <Marker position={[position.lat, position.lng]} icon={locationIcon} interactive={false} />
        </>
      )}

      <div
        ref={containerRef}
        className="absolute right-4 bottom-8 z-[1000] flex flex-col items-end gap-2"
      >
        {status === 'error' && (
          <div className="flex max-w-[260px] items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-md">
            <span className="flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              aria-label="Meldung schließen"
              className="shrink-0 text-slate-400 transition-colors hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={handleLocate}
          disabled={status === 'locating'}
          aria-label="Zu meinem Standort springen"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          {status === 'locating' ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="7" />
              <line x1="12" y1="1" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="23" />
              <line x1="1" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="23" y2="12" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}

export default LocateControl
