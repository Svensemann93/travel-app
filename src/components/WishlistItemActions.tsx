import { useTranslation } from 'react-i18next'

type Props = {
  onAddToTrip: () => void
  onShow: () => void
  className?: string
}

function WishlistItemActions({ onAddToTrip, onShow, className = '' }: Props) {
  const { t } = useTranslation('map')

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onAddToTrip}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-blue-700"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        {t('wishlist.addToTripFull')}
      </button>
      <button
        type="button"
        onClick={onShow}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3z" />
          <path d="M9 7v13M15 4v13" />
        </svg>
        {t('wishlist.onMap')}
      </button>
    </div>
  )
}

export default WishlistItemActions
