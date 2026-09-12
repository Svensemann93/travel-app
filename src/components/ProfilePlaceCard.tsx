import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PopupPhoto from './PopupPhoto'
import StarDisplay from './StarDisplay'
import Lightbox from './Lightbox'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import type { ShowcasePoint } from '../lib/showcasePoints'
import type { JournalLink } from '../lib/placeJournals'

type Props = { point: ShowcasePoint | null; journals?: JournalLink[] }

function ProfilePlaceCard({ point, journals = [] }: Props) {
  const { t } = useTranslation(['profile', 'category'])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!point) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
        {t('mapTab.hint')}
      </div>
    )
  }

  const category = CATEGORY_MAP[point.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
  const website = point.website_url?.replace(/^https?:\/\//, '')

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
      {point.photos.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {point.photos.map((photo, index) => (
            <PopupPhoto
              key={photo.id}
              path={photo.thumb_url ?? photo.url}
              alt={point.name}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold text-slate-900">{point.name}</h3>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
          {t(`category:${category.id}`)}
        </span>
        {point.rating ? <StarDisplay value={point.rating} /> : null}
      </div>

      {point.description ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {point.description}
        </p>
      ) : null}

      {journals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {journals.map((journal) => (
            <Link
              key={journal.id}
              to={`/journal/${journal.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
            >
              {t('mapTab.openJournal', { title: journal.title })}
            </Link>
          ))}
        </div>
      )}

      {website ? (
        <a
          href={point.website_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block truncate text-sm text-blue-600 hover:underline"
        >
          {website}
        </a>
      ) : null}

      {lightboxIndex !== null && (
        <Lightbox
          photos={point.photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

export default ProfilePlaceCard
