import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import StarDisplay from './StarDisplay'
import WishlistItemActions from './WishlistItemActions'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'
import type { PublicPlace } from '../types/place'

type Props = {
  place: PublicPlace
  onShow: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onRemove: (placeId: string) => void
  isRemoving: boolean
}

function WishlistItem({ place, onShow, onAddToTrip, onRemove, isRemoving }: Props) {
  const { t } = useTranslation(['map', 'category'])
  const photo = place.photos?.[0]
  const category = CATEGORY_MAP[place.category] ?? CATEGORY_MAP[DEFAULT_CATEGORY]

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md sm:flex-row">
      <button
        type="button"
        onClick={() => onShow(place)}
        className="flex w-full flex-shrink-0 sm:w-auto"
        aria-label={place.name}
      >
        {photo ? (
          <SignedImage
            path={photo.thumb_url ?? photo.url}
            alt={place.name}
            className="h-40 w-full object-cover sm:h-full sm:w-40"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-3xl text-slate-300 sm:h-full sm:w-40">
            ⛰
          </div>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate pr-1 font-semibold text-slate-900">{place.name}</h3>
          <button
            type="button"
            onClick={() => onRemove(place.id)}
            disabled={isRemoving}
            aria-label={t('wishlist.remove')}
            className="flex-shrink-0 text-slate-300 transition-colors hover:text-red-500 disabled:opacity-40"
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
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ color: category.color, backgroundColor: `${category.color}1a` }}
          >
            {t(`category:${category.id}`)}
          </span>
          {place.avg_rating != null && (
            <span className="inline-flex items-center gap-1 text-sm">
              <StarDisplay value={place.avg_rating} className="text-sm" />
              <span className="font-medium text-slate-700">{place.avg_rating.toFixed(1)}</span>
              <span className="text-slate-400">({place.visit_count})</span>
            </span>
          )}
          {place.visited_by_me && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {t('wishlist.visited')}
            </span>
          )}
        </div>

        {place.username && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
              {place.username.charAt(0).toUpperCase()}
            </span>
            {t('public.sharedBy', { username: place.username })}
          </div>
        )}

        <WishlistItemActions
          onAddToTrip={() => onAddToTrip(place)}
          onShow={() => onShow(place)}
          className="mt-auto flex flex-wrap gap-2 pt-1"
        />
      </div>
    </div>
  )
}

export default WishlistItem
