import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import SignedImage from './SignedImage'
import { visiblePlacePhotos } from '../lib/journalPhotos'
import type { JournalWithEntries } from '../types/journal'

type Candidate = { id: string; path: string; thumbPath: string }

type Props = {
  isOpen: boolean
  journal: JournalWithEntries
  currentPath: string | null
  onPick: (path: string) => void
  onRemove: () => void
  onClose: () => void
}

function collectCandidates(journal: JournalWithEntries): Candidate[] {
  const out: Candidate[] = []
  const seen = new Set<string>()
  for (const entry of journal.journal_entries) {
    for (const photo of [...visiblePlacePhotos(entry), ...entry.photos]) {
      if (photo.url && !seen.has(photo.url)) {
        seen.add(photo.url)
        out.push({ id: photo.id, path: photo.url, thumbPath: photo.thumb_url ?? photo.url })
      }
    }
  }
  return out
}

function CoverPicker({ isOpen, journal, currentPath, onPick, onRemove, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  const candidates = collectCandidates(journal)

  return createPortal(
    <div
      className="fixed inset-0 z-[1600] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-base font-semibold text-slate-800">Titelbild wählen</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Dieses Tagebuch hat noch keine Fotos, die als Titelbild dienen könnten.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {candidates.map((c) => {
                const active = c.path === currentPath
                return (
                  <button
                    key={c.id}
                    onClick={() => onPick(c.path)}
                    className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${
                      active ? 'ring-blue-600' : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    <SignedImage path={c.thumbPath} alt="" className="h-full w-full object-cover" />
                    {active && (
                      <span className="absolute right-1 top-1 rounded-full bg-blue-600 p-0.5 text-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {currentPath && (
          <div className="shrink-0 border-t border-slate-100 p-4">
            <button
              onClick={onRemove}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Titelbild entfernen
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default CoverPicker
