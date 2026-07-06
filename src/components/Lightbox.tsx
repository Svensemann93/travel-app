import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { useFocusTrap } from '../hooks/useFocusTrap'

type LightboxPhoto = { id: string; url: string }

type Props = {
  photos: LightboxPhoto[]
  initialIndex: number
  onClose: () => void
}

function Lightbox({ photos, initialIndex, onClose }: Props) {
  const { t } = useTranslation('common')
  const [index, setIndex] = useState(initialIndex)
  const containerRef = useFocusTrap<HTMLDivElement>(true)

  const touchStartX = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || photos.length < 2) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      setIndex((i) => (dx < 0 ? (i + 1) % photos.length : (i - 1 + photos.length) % photos.length))
    }
    touchStartX.current = null
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, photos.length])
  const photo = photos[index]

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 text-white text-3xl hover:text-slate-300"
        aria-label={t('action.close')}
      >
        ✕
      </button>
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i - 1 + photos.length) % photos.length)
            }}
            className="absolute left-4 text-white text-4xl hover:text-slate-300 px-3"
            aria-label={t('photo.previous')}
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i + 1) % photos.length)
            }}
            className="absolute right-4 text-white text-4xl hover:text-slate-300 px-3"
            aria-label={t('photo.next')}
          >
            ›
          </button>
        </>
      )}
      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <SignedImage
          key={photo.id}
          path={photo.url}
          alt=""
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>
      {photos.length > 1 && (
        <div className="absolute bottom-4 text-white text-sm">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>,
    document.body,
  )
}

export default Lightbox
