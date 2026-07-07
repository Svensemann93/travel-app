import { Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import type { PublicPlace } from '../types/place'
import SignedImage from './SignedImage'
import PopupDescription from './PopupDescription'
import { CATEGORY_MAP, DEFAULT_CATEGORY } from '../lib/categories'

const CONTENT_MAX = 372

type Props = {
  place: PublicPlace
  onPhotoClick: (place: PublicPlace, index: number) => void
}

function PublicPlacePopup({ place, onPhotoClick }: Props) {
  const { t } = useTranslation(['map', 'category'])
  const photos = place.photos ?? []
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
          {photos.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPhotoClick(place, i)
                  }}
                  className="shrink-0 cursor-zoom-in"
                >
                  <SignedImage
                    path={p.thumb_url ?? p.url}
                    alt={place.name}
                    className="h-40 w-56 rounded object-cover"
                  />
                </button>
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

          {place.rating ? (
            <div className="text-sm leading-none">
              <span className="text-yellow-400">{'★'.repeat(place.rating)}</span>
              <span className="text-slate-300">{'★'.repeat(5 - place.rating)}</span>
            </div>
          ) : null}

          {place.price_level ? (
            <div className="text-sm font-medium leading-none text-green-700">
              {'$'.repeat(place.price_level)}
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

          {place.username ? (
            <div className="border-t border-slate-100 pt-1 text-xs text-slate-500">
              {t('public.sharedBy', { username: place.username })}
            </div>
          ) : null}
        </div>
      </div>
    </Popup>
  )
}

export default PublicPlacePopup
