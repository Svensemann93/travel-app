import { Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import type { Place } from '../types/place'
import PopupPhoto from './PopupPhoto'
import PopupDescription from './PopupDescription'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import { visitOf } from '../lib/placeVisits'
import StarDisplay from './StarDisplay'
import type { MyPlaceStats } from '../lib/placesApi'

const CONTENT_MAX = 372

type Props = {
  place: Place
  stats?: MyPlaceStats
  autoPan?: boolean
  onPhotoClick: (place: Place, index: number) => void
  onEdit?: (place: Place) => void
  onDelete?: (place: Place) => void
  onAddToTrip?: (place: Place) => void
}

function PlacePopup({
  place,
  stats,
  onPhotoClick,
  onEdit,
  onDelete,
  onAddToTrip,
  autoPan = false,
}: Props) {
  const { t } = useTranslation(['map', 'common', 'category'])
  const photos = (place.photos ?? []).slice().sort((a, b) => a.position - b.position)
  const websiteText = place.website_url
    ? place.website_url.replace('https://', '').replace('http://', '')
    : ''
  const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]
  const visit = visitOf(place)

  return (
    <Popup minWidth={280} autoPan={autoPan} autoPanPadding={[20, 20]}>
      <div
        data-popup-content
        className="flex min-w-[280px] flex-col gap-2"
        style={{ maxHeight: CONTENT_MAX }}
      >
        <div className="shrink-0 space-y-2">
          {photos.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {photos.map((p, i) => (
                <PopupPhoto
                  key={p.id}
                  path={p.thumb_url ?? p.url}
                  alt={place.name}
                  onClick={() => onPhotoClick(place, i)}
                />
              ))}
            </div>
          ) : null}

          <strong className="block text-base leading-tight">{place.name}</strong>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
              {t(`category:${category.id}`)}
            </span>
          </div>

          {stats && stats.avg_rating != null ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-sm leading-none">
                <StarDisplay value={stats.avg_rating} />
                <span className="text-slate-600">{stats.avg_rating.toFixed(1)}</span>
                <span className="text-slate-400">
                  · {t('visits.count', { count: stats.visit_count })}
                </span>
              </div>
              {visit?.rating ? (
                <div className="flex items-center gap-1.5 text-xs leading-none text-slate-500">
                  <span>{t('visits.yourRatingLabel')}:</span>
                  <StarDisplay value={visit.rating} className="text-xs" />
                </div>
              ) : null}
            </div>
          ) : visit?.rating ? (
            <div className="text-sm leading-none">
              <StarDisplay value={visit.rating} />
            </div>
          ) : null}

          {visit?.price_level ? (
            <div className="text-sm font-medium leading-none text-green-700">
              {'$'.repeat(visit.price_level)}
            </div>
          ) : null}
        </div>

        {place.description ? <PopupDescription text={place.description} /> : null}

        <div className="shrink-0 space-y-2">
          {place.website_url ? (
            <a
              href={place.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm leading-tight text-blue-600 hover:underline"
            >
              {websiteText}
            </a>
          ) : null}
          {(onAddToTrip || onEdit || onDelete) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-1">
              {onAddToTrip && (
                <button
                  type="button"
                  onClick={() => onAddToTrip(place)}
                  className="text-sm leading-tight text-green-700 hover:underline"
                >
                  {t('addToTrip')}
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(place)}
                  className="text-sm leading-tight text-blue-600 hover:underline"
                >
                  {t('common:action.edit')}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(place)}
                  className="text-sm leading-tight text-red-600 hover:underline"
                >
                  {t('common:action.delete')}
                </button>
              )}
            </div>
          )}{' '}
        </div>
      </div>
    </Popup>
  )
}

export default PlacePopup
