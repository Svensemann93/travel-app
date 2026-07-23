import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { useTrips } from '../hooks/useTrips'
import { useJournals } from '../hooks/useJournals'
import { useMyVisitedStats } from '../hooks/useMyVisitedStats'
import { availableYears, computeYearReview } from '../lib/yearReview'
import type { YearSelection } from '../lib/yearReview'
import AppHeader from '../components/AppHeader'
import QueryBoundary from '../components/QueryBoundary'
import YearReviewCard from '../components/YearReviewCard'
import YearReviewPhotos from '../components/YearReviewPhotos'
import YearReviewMap from '../components/YearReviewMap'

function YearReviewPage() {
  const { t } = useTranslation('review')
  const navigate = useNavigate()
  const placesQuery = usePlaces()
  const tripsQuery = useTrips()
  const journalsQuery = useJournals()
  const visitsQuery = useMyVisitedStats()
  const queries = [placesQuery, tripsQuery, journalsQuery, visitsQuery]

  const places = useMemo(() => placesQuery.data ?? [], [placesQuery.data])
  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data])
  const journals = useMemo(() => journalsQuery.data ?? [], [journalsQuery.data])
  const visits = useMemo(() => visitsQuery.data ?? [], [visitsQuery.data])

  const years = useMemo(
    () => availableYears(places, visits, trips, journals),
    [places, visits, trips, journals],
  )
  const [selected, setSelected] = useState<YearSelection>('all')

  const review = useMemo(
    () => computeYearReview(places, visits, trips, journals, selected),
    [places, visits, trips, journals, selected],
  )

  const hasPhotos = review.photos.length > 0

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <AppHeader />
      <main className={`mx-auto p-4 md:px-8 md:py-6 ${hasPhotos ? 'max-w-5xl' : 'max-w-md'}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/passport"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
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
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t('back')}
          </Link>

          <select
            value={String(selected)}
            onChange={(e) => setSelected(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            aria-label={t('year')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            <option value="all">{t('all')}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <QueryBoundary
          isLoading={queries.some((query) => query.isLoading)}
          isError={queries.some((query) => query.isError)}
          error={queries.find((query) => query.error)?.error}
          onRetry={() => queries.forEach((query) => void query.refetch())}
        >
          {hasPhotos ? (
            <div className="grid gap-6 md:grid-cols-[minmax(0,26rem)_1fr]">
              <YearReviewCard review={review} />
              <YearReviewPhotos
                photos={review.photos}
                onSelect={(placeId) => navigate(`/?focus=${placeId}`)}
              />
            </div>
          ) : (
            <YearReviewCard review={review} />
          )}
          <YearReviewMap
            points={review.points}
            onSelect={(placeId) => navigate(`/?focus=${placeId}`)}
          />
        </QueryBoundary>
      </main>
    </div>
  )
}

export default YearReviewPage
