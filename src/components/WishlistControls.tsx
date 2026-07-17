import { useTranslation } from 'react-i18next'
import CategoryFilter from './CategoryFilter'
import { WISHLIST_SORTS } from '../lib/wishlist'
import type { WishlistSort } from '../lib/wishlist'

type Props = {
  sort: WishlistSort
  onSortChange: (sort: WishlistSort) => void
  grouped: boolean
  onGroupedChange: (grouped: boolean) => void
}

function WishlistControls({ sort, onSortChange, grouped, onGroupedChange }: Props) {
  const { t } = useTranslation('map')

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <select
        aria-label={t('wishlist.sortLabel')}
        value={sort}
        onChange={(e) => onSortChange(e.target.value as WishlistSort)}
        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {WISHLIST_SORTS.map((option) => (
          <option key={option} value={option}>
            {t(`wishlist.sort.${option}`)}
          </option>
        ))}
      </select>

      <button
        type="button"
        aria-pressed={grouped}
        aria-label={t('wishlist.groupByCountry')}
        onClick={() => onGroupedChange(!grouped)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-sm ring-1 transition-colors ${
          grouped
            ? 'bg-sky-50 text-sky-700 ring-sky-200'
            : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
        }`}
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
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
        <span className="hidden sm:inline">{t('wishlist.groupByCountry')}</span>
      </button>

      <CategoryFilter className="hidden md:block" />
    </div>
  )
}

export default WishlistControls
