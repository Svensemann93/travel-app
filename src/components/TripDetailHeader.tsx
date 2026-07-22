import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import TripStatusBadge from './TripStatusBadge'
import HeaderMenu from './HeaderMenu'
import { tripStatus } from '../lib/tripStatus'
import { fallbackCoverPath } from '../lib/tripCoverFallback'
import { useFormatDate } from '../hooks/useFormatDate'
import type { TripWithPlaces } from '../types/trip'

const SCROLLBAR =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/40'

type Props = {
  trip: TripWithPlaces
  onEdit: () => void
  onDelete: () => void
  onCreateJournal: () => void
}

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white'

function TripDetailHeader({ trip, onEdit, onDelete, onCreateJournal }: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const { formatDateRange } = useFormatDate()
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const status = tripStatus(trip.start_date, trip.end_date)
  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  const coverPath = trip.cover_photo_path ?? fallbackCoverPath(trip.id)
  const coverPosition = `${trip.cover_focus_x ?? 50}% ${trip.cover_focus_y ?? 50}%`

  useLayoutEffect(() => {
    const node = descriptionRef.current
    if (!node || expanded) return
    setIsOverflowing(node.scrollHeight > node.clientHeight + 1)
  }, [trip.description, expanded])

  return (
    <div className="relative mb-6 min-h-[16rem] overflow-hidden rounded-2xl shadow-sm sm:min-h-[22rem]">
      <SignedImage
        path={coverPath}
        alt={t('cover.alt')}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: coverPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
        <TripStatusBadge status={status} />
        <div className="flex flex-shrink-0 gap-1.5">
          <button
            type="button"
            onClick={onCreateJournal}
            aria-label={t('createJournal')}
            title={t('createJournal')}
            className={iconButton}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('common:action.edit')}
            title={t('common:action.edit')}
            className={iconButton}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <HeaderMenu
            label={t('moreActions')}
            items={[{ label: t('common:action.delete'), onClick: onDelete, destructive: true }]}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        {expanded && (
          <div className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 bg-gradient-to-t from-black/70 to-transparent" />
        )}
        <div className="relative">
          <h2 className="line-clamp-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {trip.name}
          </h2>
          {dateRange && <p className="mt-1.5 text-sm text-white/85">{dateRange}</p>}
          {trip.description && (
            <>
              <p
                ref={descriptionRef}
                className={`mt-2 max-w-2xl text-sm text-white/80 ${
                  expanded ? `max-h-32 overflow-y-auto pr-1 ${SCROLLBAR}` : 'line-clamp-2'
                }`}
              >
                {trip.description}
              </p>
              {(isOverflowing || expanded) && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  className="mt-1 text-sm font-medium text-white/90 underline-offset-2 hover:underline"
                >
                  {expanded ? t('description.less') : t('description.more')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TripDetailHeader
