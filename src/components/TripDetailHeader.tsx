import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import TripStatusBadge from './TripStatusBadge'
import { tripStatus } from '../lib/tripStatus'
import { fallbackCoverPath } from '../lib/tripCoverFallback'
import { useFormatDate } from '../hooks/useFormatDate'
import type { TripWithPlaces } from '../types/trip'

type Props = {
  trip: TripWithPlaces
  onEdit: () => void
  onDelete: () => void
  onCreateJournal: () => void
}

function TripDetailHeader({ trip, onEdit, onDelete, onCreateJournal }: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const { formatDateRange } = useFormatDate()
  const status = tripStatus(trip.start_date, trip.end_date)
  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  const coverPath = trip.cover_photo_path ?? fallbackCoverPath(trip.id)
  const coverPosition = `${trip.cover_focus_x ?? 50}% ${trip.cover_focus_y ?? 50}%`

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
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-emerald-600 shadow-sm backdrop-blur transition-colors hover:bg-white"
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
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-blue-600 shadow-sm backdrop-blur transition-colors hover:bg-white"
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
          <button
            type="button"
            onClick={onDelete}
            aria-label={t('common:action.delete')}
            title={t('common:action.delete')}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-red-600 shadow-sm backdrop-blur transition-colors hover:bg-white"
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
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <h2 className="line-clamp-2 text-2xl font-bold tracking-tight sm:text-3xl">{trip.name}</h2>{' '}
        {dateRange && <p className="mt-1.5 text-sm text-white/85">{dateRange}</p>}
        {trip.description && (
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80">{trip.description}</p>
        )}
      </div>
    </div>
  )
}

export default TripDetailHeader
