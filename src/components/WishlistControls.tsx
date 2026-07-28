import { useTranslation } from 'react-i18next'
import CategoryFilter from './CategoryFilter'
import { WISHLIST_SORTS } from '../lib/wishlist'
import type { WishlistSort } from '../lib/wishlist'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  sort: WishlistSort
  onSortChange: (sort: WishlistSort) => void
  grouped: boolean
  onGroupedChange: (grouped: boolean) => void
}

function WishlistControls({
  search,
  onSearchChange,
  sort,
  onSortChange,
  grouped,
  onGroupedChange,
}: Props) {
  const { t } = useTranslation('map')

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('wishlist.search')}
          aria-label={t('wishlist.search')}
          className="w-full rounded-md bg-white py-2 pr-3 pl-9 text-base shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </div>

      <select
        aria-label={t('wishlist.sortLabel')}
        value={sort}
        onChange={(e) => onSortChange(e.target.value as WishlistSort)}
        className="flex-1 rounded-md bg-white px-3 py-2 text-base font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:flex-none sm:text-sm"
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
