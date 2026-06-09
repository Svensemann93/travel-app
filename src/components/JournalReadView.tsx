import LeafletMap from './Map'
import MapFitBounds from './MapFitBounds'
import TripPlaceMarkers, { type NumberedPlace } from './TripPlaceMarkers'
import JournalEntryCard from './JournalEntryCard'
import { formatDate } from '../lib/dateFormat'
import type { JournalWithEntries } from '../types/journal'

type Props = {
  journal: JournalWithEntries
}

function dateSpan(entries: JournalWithEntries['journal_entries']) {
  const dates = entries
    .map((e) => e.entry_date)
    .filter((d): d is string => Boolean(d))
    .sort()
  if (dates.length === 0) return null
  const start = dates[0]
  const end = dates[dates.length - 1]
  return start === end ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`
}

function JournalReadView({ journal }: Props) {
  const entries = journal.journal_entries

  const mapped: NumberedPlace[] = []
  const entryNumbers = new Map<string, number>()
  for (const entry of entries) {
    if (entry.place) {
      const number = mapped.length + 1
      mapped.push({ place: entry.place, number })
      entryNumbers.set(entry.id, number)
    }
  }

  const span = dateSpan(entries)

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">{journal.title}</h1>
        {span && <p className="mt-1 text-sm text-slate-500">{span}</p>}
        {journal.description && <p className="mt-2 text-slate-600">{journal.description}</p>}
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        {mapped.length > 0 && (
          <div className="mb-6 lg:sticky lg:top-6 lg:mb-0 lg:w-[42%] lg:shrink-0">
            <div className="h-[40vh] overflow-hidden rounded-lg shadow-sm lg:h-[70vh]">
              <LeafletMap>
                <MapFitBounds places={mapped.map((m) => m.place)} />
                <TripPlaceMarkers places={mapped} />
              </LeafletMap>
            </div>
          </div>
        )}

        <div className="min-w-0 lg:flex-1">
          {entries.length === 0 ? (
            <p className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
              Dieses Tagebuch hat noch keine Einträge.
            </p>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  number={entryNumbers.get(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default JournalReadView
