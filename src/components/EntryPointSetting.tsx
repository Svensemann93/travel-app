import { useState } from 'react'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import { useEntryPoint, useSetEntryPoint } from '../hooks/useEntryPoint'

type SearchHit = { label: string; lat: number; lng: number }

function EntryPointSetting() {
  const { data: entryPoint } = useEntryPoint()
  const setEntryPoint = useSetEntryPoint()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setIsSearching(true)
    setError('')
    try {
      const provider = new OpenStreetMapProvider()
      const found = await provider.search({ query: q })
      setResults(found.slice(0, 5).map((r) => ({ label: r.label, lat: r.y, lng: r.x })))
      if (found.length === 0) setError('Kein Ort gefunden.')
    } catch {
      setError('Suche fehlgeschlagen. Bitte später erneut versuchen.')
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSelect(hit: SearchHit) {
    setError('')
    try {
      await setEntryPoint.mutateAsync({ latitude: hit.lat, longitude: hit.lng, label: hit.label })
      setResults([])
      setQuery('')
    } catch {
      setError('Speichern fehlgeschlagen.')
    }
  }

  async function handleReset() {
    setError('')
    try {
      await setEntryPoint.mutateAsync(null)
    } catch {
      setError('Zurücksetzen fehlgeschlagen.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Einstiegspunkt</h3>
      <p className="text-sm text-slate-600 mb-4">
        Lege fest, wo deine Karte beim Öffnen starten soll. Ohne Einstiegspunkt startest du in der
        Weltansicht.
      </p>

      {entryPoint ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 mb-4 text-sm">
          <span className="min-w-0 truncate text-slate-700">
            {entryPoint.label ??
              `${entryPoint.latitude.toFixed(3)}, ${entryPoint.longitude.toFixed(3)}`}
          </span>
          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={setEntryPoint.isPending}
            className="shrink-0 font-medium text-slate-500 transition-colors hover:text-slate-800 disabled:opacity-50"
          >
            Zurücksetzen
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500 mb-4">Aktuell: Weltansicht</p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSearch()
          }}
          placeholder="Ort suchen …"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={isSearching}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
        >
          {isSearching ? 'Suche…' : 'Suchen'}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
          {results.map((hit) => (
            <li key={`${hit.lat},${hit.lng}`}>
              <button
                type="button"
                onClick={() => void handleSelect(hit)}
                disabled={setEntryPoint.isPending}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {hit.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default EntryPointSetting
