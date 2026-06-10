import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import JournalMap from './JournalMap'
import type { NumberedPlace } from './TripPlaceMarkers'

type Props = {
  places: NumberedPlace[]
  onClose: () => void
}

function JournalMapOverlay({ places, onClose }: Props) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[1500] overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <JournalMap places={places} />
      </div>
      <button
        onClick={onClose}
        aria-label="Karte schließen"
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-lg ring-1 ring-slate-200"
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
        Schließen
      </button>
    </div>,
    document.body,
  )
}

export default JournalMapOverlay
