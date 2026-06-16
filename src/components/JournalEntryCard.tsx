import { useState } from 'react'
import SignedImage from './SignedImage'
import Lightbox from './Lightbox'
import { formatDate } from '../lib/dateFormat'
import { visiblePlacePhotos } from '../lib/journalPhotos'
import type { JournalEntryWithPlace } from '../types/journal'

type Props = {
  entry: JournalEntryWithPlace
  number?: number
  onFocus?: (id: string) => void
}

function JournalEntryCard({ entry, number, onFocus }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const placePhotos = visiblePlacePhotos(entry)
  const photos = [
    ...placePhotos.map((p) => ({ key: `place-${p.id}`, full: p.url, thumb: p.thumb_url ?? p.url })),
    ...entry.photos.map((p) => ({ key: `own-${p.id}`, full: p.url, thumb: p.thumb_url ?? p.url })),
  ]
  const single = photos.length === 1

  return (
    <article className="rounded-lg bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        {number !== undefined &&
          (onFocus ? (
            <button
              type="button"
              onClick={() => onFocus(entry.id)}
              aria-label="Auf Karte zeigen"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {number}
            </button>
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {number}
            </span>
          ))}
        {entry.entry_date && (
          <p className="text-sm font-medium text-blue-700">{formatDate(entry.entry_date)}</p>
        )}
      </div>

      {entry.title && <h2 className="mt-1 text-xl font-bold text-slate-800">{entry.title}</h2>}
      {entry.place?.name && <p className="mt-0.5 text-sm text-slate-500">{entry.place.name}</p>}
      {entry.body && (
        <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
          {entry.body}
        </p>
      )}

      {photos.length > 0 && (
        <div className={`mt-4 grid gap-2 ${single ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {photos.map((photo, i) => (
            <button
              key={photo.key}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block w-full cursor-zoom-in rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <SignedImage
                path={single ? photo.full : photo.thumb}
                alt=""
                className={
                  single ? 'w-full rounded-lg' : 'aspect-[4/3] w-full rounded-lg object-cover'
                }
              />
            </button>
          ))}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          photos={photos.map((p) => ({ id: p.key, url: p.full }))}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </article>
  )
}

export default JournalEntryCard
