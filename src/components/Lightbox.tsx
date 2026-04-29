import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SignedImage from './SignedImage'
import type { PlacePhoto } from '../types/place'

type Props = {
  photos: PlacePhoto[]
  initialIndex: number
  onClose: () => void
}

function Lightbox({ photos, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, photos.length])

  const photo = photos[index]

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 text-white text-3xl hover:text-slate-300"
        aria-label="Schließen"
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
            aria-label="Vorheriges Bild"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i + 1) % photos.length)
            }}
            className="absolute right-4 text-white text-4xl hover:text-slate-300 px-3"
            aria-label="Nächstes Bild"
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
