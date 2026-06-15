import { useState } from 'react'
import JournalMap from './JournalMap'
import JournalMapOverlay from './JournalMapOverlay'
import JournalEntryCard from './JournalEntryCard'
import SignedImage from './SignedImage'
import { formatDate } from '../lib/dateFormat'
import { visiblePlacePhotos } from '../lib/journalPhotos'
import type { NumberedPlace } from './TripPlaceMarkers'
import type { JournalWithEntries } from '../types/journal'

type Props = {
  journal: JournalWithEntries
  stickyHeader?: boolean
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

function JournalReadView({ journal, stickyHeader = false }: Props) {
  const entries = journal.journal_entries
  const [mapOpen, setMapOpen] = useState(false)

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
  const photoCount = entries.reduce(
    (sum, e) => sum + visiblePlacePhotos(e).length + e.photos.length,
    0,
  )
  const stats = [
    mapped.length > 0 ? `${mapped.length} ${mapped.length === 1 ? 'Ort' : 'Orte'}` : null,
    photoCount > 0 ? `${photoCount} ${photoCount === 1 ? 'Foto' : 'Fotos'}` : null,
  ].filter(Boolean)
  const metaLine = [span, ...stats].filter(Boolean).join('  ·  ')
  const panelTop = stickyHeader ? 'lg:top-20' : 'lg:top-8'
  const coverPosition = `${journal.cover_focus_x ?? 50}% ${journal.cover_focus_y ?? 50}%`

  return (
    <div>
      {journal.cover_photo_path && (
        <div className="mb-6 overflow-hidden rounded-xl shadow-sm">
          <SignedImage
            path={journal.cover_photo_path}
            alt={journal.title}
            className="h-48 w-full object-cover sm:h-60 lg:h-72"
            style={{ objectPosition: coverPosition }}
          />
        </div>
      )}

      <div className="lg:flex lg:items-start lg:gap-8">
        <div className={`lg:sticky ${panelTop} lg:w-[42%] lg:shrink-0`}>
          <header className="mb-5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{journal.title}</h1>
            {metaLine && <p className="mt-2 text-sm text-slate-500">{metaLine}</p>}
            {journal.description && (
              <p className="mt-3 leading-relaxed text-slate-600">{journal.description}</p>
            )}
          </header>

          {mapped.length > 0 && (
            <div className="hidden h-[60vh] overflow-hidden rounded-xl shadow-sm lg:block">
              <JournalMap places={mapped} />
            </div>
          )}
        </div>

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

      {mapped.length > 0 && (
        <button
          onClick={() => setMapOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700 lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Karte
        </button>
      )}

      {mapOpen && <JournalMapOverlay places={mapped} onClose={() => setMapOpen(false)} />}
    </div>
  )
}

export default JournalReadView
