import { Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import type { PublicPlace, PublicPlacePhoto } from '../types/place'
import PopupDescription from './PopupDescription'
import PopupPhotoStrip from './PopupPhotoStrip'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import StarDisplay from './StarDisplay'

const CONTENT_MAX = 372

type Props = {
  place: PublicPlace
  onPhotoClick: (photos: PublicPlacePhoto[], index: number) => void
  onMarkVisited: (placeId: string) => void
  onEditVisit: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onToggleWish: (place: PublicPlace) => void
}

function PublicPlacePopup({
  place,
  onPhotoClick,
  onMarkVisited,
  onEditVisit,
  onAddToTrip,
  onToggleWish,
}: Props) {
  const { t } = useTranslation(['map', 'category'])
  const websiteText = place.website_url
    ? place.website_url.replace('https://', '').replace('http://', '')
    : ''
  const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]

  return (
    <Popup minWidth={280} autoPan={false}>
      <div
        data-popup-content
        className="flex min-w-[280px] flex-col gap-2"
        style={{ maxHeight: CONTENT_MAX }}
      >
        <div className="shrink-0 space-y-2">
          <PopupPhotoStrip place={place} onPhotoClick={onPhotoClick} />

          <strong className="block text-base leading-tight">{place.name}</strong>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
              {t(`category:${category.id}`)}
            </span>
          </div>

          {place.avg_rating != null ? (
            <div className="flex items-center gap-1.5 text-sm leading-none">
              <StarDisplay value={place.avg_rating} />
              <span className="text-slate-600">{place.avg_rating.toFixed(1)}</span>
              <span className="text-slate-400">
                · {t('visits.count', { count: place.visit_count })}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              {t('visits.count', { count: place.visit_count })}
            </div>
          )}

          {place.visited_by_me && place.my_rating ? (
            <div className="flex items-center gap-1.5 text-xs leading-none text-slate-500">
              <span>{t('visits.yourRatingLabel')}:</span>
              <StarDisplay value={place.my_rating} className="text-xs" />
            </div>
          ) : null}

          {place.visited_by_me && place.my_price ? (
            <div className="flex items-center gap-1.5 text-xs leading-none text-slate-500">
              <span>{t('visits.yourPriceLabel')}:</span>
              <span className="font-medium text-green-700">
                {'$'.repeat(Math.round(place.my_price))}
              </span>
            </div>
          ) : null}

          {place.avg_price != null ? (
            <div className="text-sm font-medium leading-none text-green-700">
              {'$'.repeat(Math.round(place.avg_price))}
              <span className="ml-1 font-normal text-slate-400">
                ⌀ {place.avg_price.toFixed(1)}
              </span>
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-1">
            <button
              type="button"
              onClick={() => onAddToTrip(place)}
              className="text-sm leading-tight text-green-700 hover:underline"
            >
              {t('addToTrip')}
            </button>
            <button
              type="button"
              onClick={() => onToggleWish(place)}
              className="text-sm leading-tight text-amber-600 hover:underline"
            >
              {place.wished_by_me ? t('wishlist.remove') : t('wishlist.add')}
            </button>
            {place.visited_by_me ? (
              <button
                type="button"
                onClick={() => onEditVisit(place)}
                className="text-sm leading-tight text-blue-600 hover:underline"
              >
                {t('visits.edit')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMarkVisited(place.id)}
                className="text-sm leading-tight text-slate-600 hover:underline"
              >
                {t('visits.markVisited')}
              </button>
            )}
          </div>

          {place.username ? (
            <div className="text-xs text-slate-500">
              {t('public.sharedBy', { username: place.username })}
            </div>
          ) : null}
        </div>
      </div>
    </Popup>
  )
}

export default PublicPlacePopup
