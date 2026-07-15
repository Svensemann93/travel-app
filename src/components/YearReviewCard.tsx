import { useTranslation } from 'react-i18next'
import type { YearReview } from '../lib/yearReview'
import ReviewStamp from './ReviewStamp'

type Props = {
  review: YearReview
}

function YearReviewCard({ review }: Props) {
  const { t, i18n } = useTranslation('review')
  const { t: tc } = useTranslation('category')
  const nf = new Intl.NumberFormat(i18n.language === 'de' ? 'de-CH' : 'en-US')
  const isAll = review.year === 'all'
  const yearLabel = isAll ? t('all') : String(review.year)
  const empty =
    review.placeCount === 0 &&
    review.tripCount === 0 &&
    review.journalCount === 0 &&
    review.photoCount === 0

  const fields = [
    { k: t('fields.places'), v: nf.format(review.placeCount) },
    {
      k: t('fields.countries'),
      v: nf.format(review.countryCount),
      extra: review.newCountryCount > 0 ? t('new', { count: review.newCountryCount }) : undefined,
    },
    { k: t('fields.continents'), v: nf.format(review.continentCount) },
    { k: t('fields.trips'), v: nf.format(review.tripCount) },
    { k: t('fields.journals'), v: nf.format(review.journalCount) },
    { k: t('fields.photos'), v: nf.format(review.photoCount) },
  ]

  const mrz = `P<REVIEW<<${yearLabel}<<PLACES${review.placeCount}<CTRY${review.countryCount}<<<<`

  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#0e3d49] p-5 text-[#efe7d2] shadow-2xl">
      <div className="pointer-events-none absolute inset-2 rounded-[15px] border border-[#39bbde]/30" />

      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#39bbde]">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#f4c15a] align-middle" />
        {t('eyebrow')}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-4xl font-bold leading-none tracking-tight">{yearLabel}</span>
        {!empty && <ReviewStamp label={t('stampLabel', { countries: review.countryCount })} />}
      </div>

      {empty ? (
        <p className="mt-5 text-sm text-[#efe7d2]/60">{t('subtitleEmpty', { year: yearLabel })}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#efe7d2]/60">
            {t('subtitle', { countries: review.countryCount, places: review.placeCount })}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#39bbde]/25 bg-[#39bbde]/25">
            {fields.map((f) => (
              <div key={f.k} className="bg-[#0e3d49] px-3 py-2">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#39bbde]">
                  {f.k}
                </div>
                <div className="text-xl font-semibold">
                  {f.v}
                  {f.extra && (
                    <span className="ml-1 align-top font-mono text-[11px] font-normal text-[#f4c15a]">
                      {f.extra}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {review.topCategory && (
            <div className="mt-2.5 border-b border-dashed border-[#39bbde]/25 pb-2.5">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#efe7d2]/55">
                {t('topCategory')}
              </div>
              <div className="text-base font-medium">
                {tc(review.topCategory.id)}{' '}
                <span className="text-[#efe7d2]/55">
                  · {t('topCategoryValue', { count: review.topCategory.count })}
                </span>
              </div>
            </div>
          )}

          {review.highlight && (
            <div className="mt-2.5">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#efe7d2]/55">
                {t('highlight')}
              </div>
              <div className="text-base font-medium">
                {review.highlight.name}{' '}
                <span className="text-[#f4c15a]">· ★ {review.highlight.rating.toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="-mx-5 -mb-5 mt-3 overflow-hidden whitespace-nowrap bg-[#0a2e37] px-5 py-2 font-mono text-[11px] tracking-wider text-[#efe7d2]/45">
            {mrz}
          </div>
        </>
      )}
    </div>
  )
}

export default YearReviewCard
