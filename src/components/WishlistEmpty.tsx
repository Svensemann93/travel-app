import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EmptyState from './EmptyState'

function WishlistEmpty() {
  const { t } = useTranslation('map')

  return (
    <EmptyState
      title={t('wishlist.emptyTitle')}
      message={t('wishlist.emptyMessage')}
      action={
        <Link
          to="/"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          {t('wishlist.toMap')}
        </Link>
      }
    />
  )
}

export default WishlistEmpty
