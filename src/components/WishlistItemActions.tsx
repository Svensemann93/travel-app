import { useTranslation } from 'react-i18next'

type Props = {
  onAddToTrip: () => void
  onRemove: () => void
  isRemoving: boolean
  className?: string
}

function WishlistItemActions({ onAddToTrip, onRemove, isRemoving, className = '' }: Props) {
  const { t } = useTranslation('map')

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onAddToTrip}
        className="text-sm whitespace-nowrap text-green-700 hover:underline"
      >
        {t('addToTrip')}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        className="text-sm whitespace-nowrap text-red-600 hover:underline disabled:opacity-50"
      >
        {isRemoving ? '…' : t('wishlist.remove')}
      </button>
    </div>
  )
}

export default WishlistItemActions
