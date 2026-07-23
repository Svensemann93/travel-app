import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReviewPhoto } from '../lib/yearReview'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
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

function nextHidden(from: number, shown: number[], total: number): number {
  const visible = new Set(shown)
  let candidate = from
  for (let step = 0; step < total; step += 1) {
    if (!visible.has(candidate)) return candidate
    candidate = (candidate + 1) % total
  }
  return from
}

type TileProps = {
  photo: ReviewPhoto
  previous: ReviewPhoto | null
  still: boolean
  onSelect: (placeId: string) => void
}

function MosaicTile({ photo, previous, still, onSelect }: TileProps) {
  const { t } = useTranslation('review')

  return (
    <button
      type="button"
      title={t('photoAction', { name: photo.name })}
      aria-label={t('photoAction', { name: photo.name })}
      onClick={() => onSelect(photo.placeId)}
      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39bbde] md:aspect-auto md:h-full"
    >
      {previous && previous.path !== photo.path ? (
        <SignedImage
          key={previous.path}
          path={previous.path}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div key={photo.path} className={`absolute inset-0 ${still ? '' : 'review-photo-in'}`}>
        <SignedImage
          path={photo.path}
          alt=""
          className={`h-full w-full object-cover ${
            still ? '' : 'transition-transform duration-500 group-hover:scale-105'
          }`}
        />
      </div>
    </button>
  )
}

type MosaicProps = {
  photos: ReviewPhoto[]
  cellCount: number
  still: boolean
  onSelect: (placeId: string) => void
}

function PhotoMosaic({ photos, cellCount, still, onSelect }: MosaicProps) {
  const total = photos.length
  const [state, setState] = useState(() => ({
    shown: Array.from({ length: cellCount }, (_, i) => i),
    previous: Array.from({ length: cellCount }, (): number | null => null),
    incoming: cellCount % total,
    cell: 0,
  }))

  const canRotate = !still && total > cellCount
  const step = Math.round(INTERVAL_MS / cellCount)

  useEffect(() => {
    if (!canRotate) return
    const id = window.setInterval(() => {
      setState((current) => {
        const photo = nextHidden(current.incoming, current.shown, total)
        const shown = [...current.shown]
        const previous = [...current.previous]
        previous[current.cell] = shown[current.cell]
        shown[current.cell] = photo
        return {
          shown,
          previous,
          incoming: (photo + 1) % total,
          cell: (current.cell + 1) % cellCount,
        }
      })
    }, step)
    return () => window.clearInterval(id)
  }, [canRotate, total, cellCount, step])

  return (
    <div className="grid grid-cols-3 gap-2 md:h-full md:grid-rows-3">
      {state.shown.map((photoIndex, cell) => {
        const previousIndex = state.previous[cell]
        return (
          <MosaicTile
            key={cell}
            photo={photos[photoIndex]}
            previous={previousIndex === null ? null : photos[previousIndex]}
            still={still}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}

type Props = {
  photos: ReviewPhoto[]
  onSelect: (placeId: string) => void
}

function YearReviewPhotos({ photos, onSelect }: Props) {
  const still = usePrefersReducedMotion()
  const shuffled = useMemo(() => shuffle(photos), [photos])

  if (shuffled.length === 0) return null

  return (
    <PhotoMosaic
      key={shuffled.map((photo) => photo.path).join('|')}
      photos={shuffled}
      cellCount={Math.min(VISIBLE, shuffled.length)}
      still={still}
      onSelect={onSelect}
    />
  )
}

export default YearReviewPhotos
