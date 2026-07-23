import PopupPhoto from './PopupPhoto'
import { useMyPlacePhotos } from '../hooks/useMyPlacePhotos'
import type { PublicPlace, PublicPlacePhoto } from '../types/place'

type Props = {
  place: PublicPlace
  onPhotoClick: (photos: PublicPlacePhoto[], index: number) => void
}

function PopupPhotoStrip({ place, onPhotoClick }: Props) {
  const { data: mine = [] } = useMyPlacePhotos(place.visited_by_me ? place.id : null)
  const shared = place.photos ?? []
  const sharedIds = new Set(shared.map((photo) => photo.id))
  const photos: PublicPlacePhoto[] = [
    ...shared,
    ...mine
      .filter((photo) => !sharedIds.has(photo.id))
      .map((photo) => ({ id: photo.id, url: photo.url, thumb_url: photo.thumb_url })),
  ]

  if (photos.length === 0) return null

  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5">
      {photos.map((photo, index) => (
        <PopupPhoto
          key={photo.id}
          path={photo.thumb_url ?? photo.url}
          alt={place.name}
          onClick={() => onPhotoClick(photos, index)}
        />
      ))}
    </div>
  )
}

export default PopupPhotoStrip
