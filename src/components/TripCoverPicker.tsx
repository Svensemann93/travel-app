import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { STANDARD_COVERS, collectTripPhotoCandidates } from '../lib/tripCovers'
import type { CoverCandidate } from '../lib/tripCovers'
import type { TripWithPlaces } from '../types/trip'

type Props = {
  isOpen: boolean
  trip: TripWithPlaces
  currentPath: string | null
  onPick: (path: string) => void
  onRemove: () => void
  onClose: () => void
}

function CandidateGrid({
  candidates,
  currentPath,
  onPick,
}: {
  candidates: CoverCandidate[]
  currentPath: string | null
  onPick: (path: string) => void
}) {
  return (
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
              <span className="absolute top-1 right-1 rounded-full bg-blue-600 p-0.5 text-white">
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
  )
}

function TripCoverPicker({ isOpen, trip, currentPath, onPick, onRemove, onClose }: Props) {
  const { t } = useTranslation(['trips', 'common'])

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
  const photoCandidates = collectTripPhotoCandidates(trip)

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
          <h2 className="text-base font-semibold text-slate-800">{t('cover.pickerTitle')}</h2>
          <button
            onClick={onClose}
            aria-label={t('common:action.close')}
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {photoCandidates.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {t('cover.fromPlaces')}
              </h3>
              <CandidateGrid
                candidates={photoCandidates}
                currentPath={currentPath}
                onPick={onPick}
              />
            </section>
          )}

          <section>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {t('cover.standard')}
            </h3>
            <CandidateGrid candidates={STANDARD_COVERS} currentPath={currentPath} onPick={onPick} />
          </section>
        </div>

        {currentPath && (
          <div className="shrink-0 border-t border-slate-100 p-4">
            <button
              onClick={onRemove}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {t('cover.remove')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default TripCoverPicker
