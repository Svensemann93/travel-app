import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReviewPhoto } from '../lib/yearReview'
import SignedImage from './SignedImage'

const VISIBLE = 9
const INTERVAL_MS = 18000

function shuffle(photos: ReviewPhoto[]): ReviewPhoto[] {
  const result = [...photos]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = result[i]
    result[i] = result[j]
    result[j] = swap
  }
  return result
}

function pickOther(current: number, total: number): number {
  if (total <= 1) return current
  const offset = Math.floor(Math.random() * (total - 1))
  return offset >= current ? offset + 1 : offset
}

type TileProps = {
  photos: ReviewPhoto[]
  startDelay: number
  label: string
  onSelect: (placeId: string) => void
}

function RotatingTile({ photos, startDelay, label, onSelect }: TileProps) {
  const total = photos.length
  const [frame, setFrame] = useState(() => ({
    previous: 0,
    current: 0,
    next: pickOther(0, total),
  }))

  useEffect(() => {
    if (total <= 1) return
    let interval: number | undefined
    const advance = () =>
      setFrame((current) => ({
        previous: current.current,
        current: current.next,
        next: pickOther(current.next, total),
      }))
    const timeout = window.setTimeout(() => {
      advance()
      interval = window.setInterval(advance, INTERVAL_MS)
    }, startDelay)
    return () => {
      window.clearTimeout(timeout)
      if (interval !== undefined) window.clearInterval(interval)
    }
  }, [total, startDelay])

  const mounted = new Set([frame.previous, frame.current, frame.next])

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => onSelect(photos[frame.current].placeId)}
      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39bbde] md:aspect-auto md:h-full"
    >
      {photos.map((photo, i) =>
        mounted.has(i) ? (
          <div
            key={photo.path}
            className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
              i === frame.current ? 'opacity-100' : 'opacity-0'
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
  const shuffled = useMemo(() => shuffle(photos), [photos])

  if (shuffled.length === 0) return null
  const cellCount = Math.min(VISIBLE, shuffled.length)
  const cells: ReviewPhoto[][] = Array.from({ length: cellCount }, () => [])
  shuffled.forEach((photo, i) => cells[i % cellCount].push(photo))
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
