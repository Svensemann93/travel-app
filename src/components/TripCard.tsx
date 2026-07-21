import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import TripStatusBadge from './TripStatusBadge'
import { tripStatus } from '../lib/tripStatus'
import { fallbackCoverPath } from '../lib/tripCoverFallback'
import { useFormatDate } from '../hooks/useFormatDate'
import type { TripListItem } from '../types/trip'
import WeatherBadge from './WeatherBadge'

type Props = {
  trip: TripListItem
  hero?: boolean
}

function TripCard({ trip, hero = false }: Props) {
  const { t } = useTranslation('trips')
  const { formatDateRange } = useFormatDate()
  const status = tripStatus(trip.start_date, trip.end_date)
  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  const coverPath = trip.cover_photo_path ?? fallbackCoverPath(trip.id)
  const coverPosition = `${trip.cover_focus_x ?? 50}% ${trip.cover_focus_y ?? 50}%`

  return (
    <Link
      to={`/trips/${trip.id}`}
      className={`group relative block overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200/60 transition-shadow hover:shadow-lg ${
        hero ? 'h-80 sm:h-96' : 'h-64'
      }`}
    >
      <SignedImage
        path={coverPath}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: coverPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <TripStatusBadge status={status} />
        {hero && <WeatherBadge coords={trip.first_stop} />}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className={`font-bold tracking-tight ${hero ? 'text-3xl' : 'text-xl'}`}>{trip.name}</h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">
          {dateRange && (
            <span className="inline-flex items-center gap-1.5">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {dateRange}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t('placeCount', { count: trip.place_count })}
          </span>
        </div>

        {hero && trip.description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 line-clamp-2">
            {trip.description}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
          {t('open')}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export default TripCard
