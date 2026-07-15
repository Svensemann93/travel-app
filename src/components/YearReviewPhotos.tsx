import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReviewPhoto } from '../lib/yearReview'
import SignedImage from './SignedImage'

const VISIBLE = 9
const INTERVAL_MS = 18000

type TileProps = {
  photos: ReviewPhoto[]
  startDelay: number
  label: string
  onSelect: (placeId: string) => void
}

function RotatingTile({ photos, startDelay, label, onSelect }: TileProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    let interval: number | undefined
    const advance = () => setIndex((current) => (current + 1) % photos.length)
    const timeout = window.setTimeout(() => {
      advance()
      interval = window.setInterval(advance, INTERVAL_MS)
    }, startDelay)
    return () => {
      window.clearTimeout(timeout)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [photos.length, startDelay])

  const total = photos.length
  const mounted = new Set([(index - 1 + total) % total, index, (index + 1) % total])

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => onSelect(photos[index].placeId)}
      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39bbde] md:aspect-auto md:h-full"
    >
      {photos.map((photo, i) =>
        mounted.has(i) ? (
          <div
            key={photo.path}
            className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <SignedImage
              path={photo.path}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : null,
      )}
    </button>
  )
}

type Props = {
  photos: ReviewPhoto[]
  onSelect: (placeId: string) => void
}

function YearReviewPhotos({ photos, onSelect }: Props) {
  const { t } = useTranslation('review')
  if (photos.length === 0) return null
  const cellCount = Math.min(VISIBLE, photos.length)
  const cells: ReviewPhoto[][] = Array.from({ length: cellCount }, () => [])
  photos.forEach((photo, i) => cells[i % cellCount].push(photo))
  const step = INTERVAL_MS / cellCount
  const label = t('photoAction')

  return (
    <div className="grid grid-cols-3 gap-2 md:h-full md:grid-rows-3">
      {cells.map((cellPhotos, c) => (
        <RotatingTile
          key={cellPhotos[0].path}
          photos={cellPhotos}
          startDelay={Math.round(c * step)}
          label={label}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default YearReviewPhotos
