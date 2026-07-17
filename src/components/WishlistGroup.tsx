import { useTranslation } from 'react-i18next'
import WishlistItem from './WishlistItem'
import type { PublicPlace } from '../types/place'

type Props = {
  title: string | null
  places: PublicPlace[]
  onShow: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onRemove: (placeId: string) => void
  isRemoving: boolean
}

function WishlistGroup({ title, places, onShow, onAddToTrip, onRemove, isRemoving }: Props) {
  const { t } = useTranslation('map')

  return (
    <section>
      {title !== null && (
        <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          {title || t('wishlist.noCountry')}
          <span className="text-xs font-normal normal-case">({places.length})</span>
        </h3>
      )}
      <ul className="space-y-3">
        {places.map((place) => (
          <li key={place.id}>
            <WishlistItem
              place={place}
              onShow={onShow}
              onAddToTrip={onAddToTrip}
              onRemove={onRemove}
              isRemoving={isRemoving}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WishlistGroup
