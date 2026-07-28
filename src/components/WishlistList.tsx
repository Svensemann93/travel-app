import WishlistItem from './WishlistItem'
import type { PublicPlace } from '../types/place'

type Props = {
  places: PublicPlace[]
  onShow: (place: PublicPlace) => void
  onAddToTrip: (place: PublicPlace) => void
  onRemove: (placeId: string) => void
  isRemoving: boolean
}

function WishlistList({ places, onShow, onAddToTrip, onRemove, isRemoving }: Props) {
  return (
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
  )
}

export default WishlistList
