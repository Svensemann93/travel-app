import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import WishlistList from './WishlistList'
import type { PublicPlace } from '../types/place'

type Props = {
  name: string
  places: PublicPlace[]
  onShow: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onRemove: (placeId: string) => void
  isRemoving: boolean
}

function WishlistGroup({ name, places, onShow, onAddToTrip, onRemove, isRemoving }: Props) {
  const { t } = useTranslation('map')
  const [open, setOpen] = useState(true)

  const thumbs = places
    .map((place) => place.photos?.[0])
    .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo))
    .slice(0, 4)

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <span className="font-semibold text-slate-900">{name || t('wishlist.noCountry')}</span>
        <span className="text-sm text-slate-400">
          {t('wishlist.placesCount', { count: places.length })}
        </span>
        {!open && thumbs.length > 0 && (
          <span className="ml-auto hidden gap-1 sm:flex">
            {thumbs.map((photo) => (
              <SignedImage
                key={photo.id}
                path={photo.thumb_url ?? photo.url}
                alt=""
                className="h-9 w-9 rounded-md object-cover"
              />
            ))}
          </span>
        )}
        <svg
          className={`text-slate-400 transition-transform ${open ? 'ml-auto' : '-rotate-90'}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <WishlistList
            places={places}
            onShow={onShow}
            onAddToTrip={onAddToTrip}
            onRemove={onRemove}
            isRemoving={isRemoving}
          />
        </div>
      )}
    </section>
  )
}

export default WishlistGroup
