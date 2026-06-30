import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import JournalMap from './JournalMap'
import JournalMapOverlay from './JournalMapOverlay'
import JournalEntryCard from './JournalEntryCard'
import SignedImage from './SignedImage'
import { useFormatDate } from '../hooks/useFormatDate'
import { visiblePlacePhotos } from '../lib/journalPhotos'
import type { NumberedPlace } from './TripPlaceMarkers'
import type { JournalWithEntries } from '../types/journal'
import type { Place } from '../types/place'

type Props = {
  journal: JournalWithEntries
  stickyHeader?: boolean
}

function dateSpan(
  entries: JournalWithEntries['journal_entries'],
  formatDate: (dateString: string) => string,
) {
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
  const { t } = useTranslation('read')
  const { formatDate } = useFormatDate()
  const entries = journal.journal_entries
  const [mapOpen, setMapOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [focus, setFocus] = useState<{ place: Place; n: number } | null>(null)
  const entryRefs = useRef(new Map<string, HTMLDivElement>())
  const focusCount = useRef(0)

  const { mapped, entryNumbers } = useMemo(() => {
    const places: NumberedPlace[] = []
    const numbers = new Map<string, number>()
    for (const entry of entries) {
      if (entry.place) {
        const number = places.length + 1
        places.push({ id: entry.id, place: entry.place, number })
        numbers.set(entry.id, number)
      }
    }
    return { mapped: places, entryNumbers: numbers }
  }, [entries])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (obs) => {
        const top = obs
          .filter((o) => o.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (top) setActiveId(top.target.getAttribute('data-entry-id'))
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 1] },
    )
    entryRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [entries])

  function scrollToEntry(id: string) {
    setActiveId(id)
    entryRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function focusEntry(id: string) {
    const entry = entries.find((e) => e.id === id)
    if (!entry?.place) return
    setActiveId(id)
    focusCount.current += 1
    setFocus({ place: entry.place, n: focusCount.current })
    const desktop =
      typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches
    if (!desktop) setMapOpen(true)
  }

  function handleOverlaySelect(id: string) {
    setMapOpen(false)
    requestAnimationFrame(() => scrollToEntry(id))
  }

  const span = dateSpan(entries, formatDate)
  const photoCount = entries.reduce(
    (sum, e) => sum + visiblePlacePhotos(e).length + e.photos.length,
    0,
  )
  const stats = [
    mapped.length > 0 ? t('places', { count: mapped.length }) : null,
    photoCount > 0 ? t('photos', { count: photoCount }) : null,
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
              <JournalMap
                places={mapped}
                activeId={activeId}
                onSelect={scrollToEntry}
                focus={focus}
              />
            </div>
          )}
        </div>

        <div className="min-w-0 lg:flex-1">
          {entries.length === 0 ? (
            <p className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
              {t('noEntries')}
            </p>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  data-entry-id={entry.id}
                  ref={(el) => {
                    if (el) entryRefs.current.set(entry.id, el)
                    else entryRefs.current.delete(entry.id)
                  }}
                >
                  <JournalEntryCard
                    entry={entry}
                    number={entryNumbers.get(entry.id)}
                    onFocus={focusEntry}
                  />
                </div>
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
          {t('map')}
        </button>
      )}

      {mapOpen && (
        <JournalMapOverlay
          places={mapped}
          activeId={activeId}
          onSelect={handleOverlaySelect}
          focus={focus}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  )
}

export default JournalReadView
