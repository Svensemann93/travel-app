import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import CategoryFilter from './CategoryFilter'
import TripMap from './TripMap'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { Place } from '../types/place'

type Props = {
  places: Place[]
  visibleNumbered: { place: Place; number: number }[]
  focusedPlace: Place | null
  onClose: () => void
}

function TripMapOverlay({ places, visibleNumbered, focusedPlace, onClose }: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const containerRef = useFocusTrap<HTMLDivElement>(true)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div ref={containerRef} tabIndex={-1} className="fixed inset-0 z-[1500] flex flex-col bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-800">{t('map.title')}</h2>
        <div className="flex items-center gap-2">
          <CategoryFilter />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common:action.close')}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <TripMap places={places} visibleNumbered={visibleNumbered} focusedPlace={focusedPlace} />
      </div>
    </div>,
    document.body,
  )
}

export default TripMapOverlay
