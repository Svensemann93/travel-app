import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Place } from '../types/place'
import PopupPhoto from './PopupPhoto'
import StarDisplay from './StarDisplay'
import Lightbox from './Lightbox'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import { visitOf } from '../lib/placeVisits'

function ProfilePlaceCard({ place }: { place: Place | null }) {
  const { t } = useTranslation(['profile', 'category'])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!place) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
        {t('mapTab.hint')}
      </div>
    )
  }

  const photos = (place.photos ?? []).slice().sort((a, b) => a.position - b.position)
  const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
  const visit = visitOf(place)
  const website = place.website_url?.replace(/^https?:\/\//, '')

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
      {photos.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <PopupPhoto
              key={photo.id}
              path={photo.thumb_url ?? photo.url}
              alt={place.name}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold text-slate-900">{place.name}</h3>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
          {t(`category:${category.id}`)}
        </span>
        {visit?.rating ? <StarDisplay value={visit.rating} /> : null}
      </div>

      {place.description ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {place.description}
        </p>
      ) : null}

      {website ? (
        <a
          href={place.website_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block truncate text-sm text-blue-600 hover:underline"
        >
          {website}
        </a>
      ) : null}

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

export default ProfilePlaceCard
