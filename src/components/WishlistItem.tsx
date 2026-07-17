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
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex">
        <button
          type="button"
          onClick={() => onShow(place)}
          className="flex min-w-0 flex-1 text-left"
        >
          {photo ? (
            <SignedImage
              path={photo.thumb_url ?? photo.url}
              alt={place.name}
              className="w-24 flex-shrink-0 self-stretch object-cover"
            />
          ) : (
            <div className="flex w-24 flex-shrink-0 items-center justify-center self-stretch bg-slate-100 text-2xl text-slate-300">
              ⭐
            </div>
          )}

          <div className="min-w-0 flex-1 p-3">
            <h3 className="truncate font-semibold text-slate-800">{place.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {t(`category:${category.id}`)}
              </span>
              {place.avg_rating != null && (
                <StarDisplay value={place.avg_rating} className="text-sm" />
              )}
              {place.visited_by_me && (
                <span className="text-xs font-medium text-green-700">{t('wishlist.done')}</span>
              )}
            </div>
            {place.username && (
              <p className="mt-1 truncate text-xs text-slate-400">
                {t('public.sharedBy', { username: place.username })}
              </p>
            )}
          </div>
        </button>

        <WishlistItemActions
          onAddToTrip={() => onAddToTrip(place)}
          onRemove={() => onRemove(place.id)}
          isRemoving={isRemoving}
          className="hidden flex-shrink-0 flex-col items-end gap-1 p-3 sm:flex"
        />
      </div>

      <WishlistItemActions
        onAddToTrip={() => onAddToTrip(place)}
        onRemove={() => onRemove(place.id)}
        isRemoving={isRemoving}
        className="flex justify-end gap-4 border-t border-slate-100 px-3 py-2 sm:hidden"
      />
    </div>
  )
}

export default WishlistItem
