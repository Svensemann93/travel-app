import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { useTrips } from '../hooks/useTrips'
import { useJournals } from '../hooks/useJournals'
import { useMyVisitedStats } from '../hooks/useMyVisitedStats'
import { computeTravelStats } from '../lib/travelStats'
import { ACHIEVEMENTS } from '../lib/achievements'
import { STAMP_ICONS } from '../lib/stampIcons'
import { CATEGORIES } from '../lib/categories'
import { CONTINENT_TOTAL, COUNTRY_TOTAL } from '../lib/continents'
import AppHeader from '../components/AppHeader'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import PassportStamp from '../components/PassportStamp'
import ProgressBar from '../components/ProgressBar'
import WorldMap from '../components/WorldMap'

function PassportPage() {
  const { t } = useTranslation('pass')
  const placesQuery = usePlaces()
  const { data: places = [] } = placesQuery
  const { data: trips = [] } = useTrips()
  const { data: journals = [] } = useJournals()
  const { data: visited = [] } = useMyVisitedStats()

  const stats = useMemo(
    () => computeTravelStats(places, visited, trips.length, journals.length),
    [places, visited, trips.length, journals.length],
  )

  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned(stats)).length

  const summary = [
    { key: 'places', value: stats.placeCount },
    { key: 'photos', value: stats.photoCount },
    { key: 'trips', value: stats.tripCount },
    { key: 'journals', value: stats.journalCount },
    { key: 'shared', value: stats.publicPlaceCount },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-4xl p-4 md:p-8">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-amber-50 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-800">{t('title')}</h2>
            <Link
              to="/review"
              className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-white"
            >
              {t('reviewLink')}
            </Link>{' '}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {t('collected', { earned: earnedCount, total: ACHIEVEMENTS.length })}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {summary.map((item) => (
              <div
                key={item.key}
                className="rounded-xl bg-white/70 px-2 py-3 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-slate-800">{item.value}</div>
                <div className="mt-0.5 text-xs text-slate-500">{t(`stats.${item.key}`)}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <ProgressBar
              label={t('progress.collection')}
              value={earnedCount}
              max={ACHIEVEMENTS.length}
              color="#F4C15A"
            />
            <ProgressBar
              label={t('progress.categories')}
              value={stats.categoriesCovered}
              max={CATEGORIES.length}
              color="#39BBDE"
            />
            <ProgressBar
              label={t('progress.continents')}
              value={stats.continentCount}
              max={CONTINENT_TOTAL}
              color="#0d9488"
            />
            <ProgressBar
              label={t('progress.countries')}
              value={stats.countryCount}
              max={COUNTRY_TOTAL}
              color="#9333ea"
            />
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{t('map.title')}</h3>
            <span className="text-sm text-slate-500">
              {t('map.count', { count: stats.countryCount })}
            </span>
          </div>
          <WorldMap visitedCodes={stats.countryCodes} />
        </section>

        <QueryBoundary
          isLoading={placesQuery.isLoading}
          isError={placesQuery.isError}
          error={placesQuery.error}
          onRetry={() => void placesQuery.refetch()}
          loading={<ListSkeleton />}
        >
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
            {ACHIEVEMENTS.map((a) => {
              const earned = a.earned(stats)
              return (
                <li key={a.id} className="flex flex-col items-center text-center">
                  <div className="aspect-square w-full max-w-[150px]">
                    <PassportStamp
                      id={a.id}
                      icon={STAMP_ICONS[a.icon]}
                      title={t(`achievements.${a.id}.title`)}
                      ink={a.ink}
                      earned={earned}
                      progressText={`${a.current(stats)}/${a.target}`}
                      caption={t('earned')}
                    />
                  </div>
                  <p
                    className={`mt-2 text-xs ${earned ? 'font-medium text-slate-700' : 'text-slate-400'}`}
                  >
                    {t(`achievements.${a.id}.desc`)}
                  </p>
                </li>
              )
            })}
          </ul>
        </QueryBoundary>
      </main>
    </div>
  )
}

export default PassportPage
