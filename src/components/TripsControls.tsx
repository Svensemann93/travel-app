import { useTranslation } from 'react-i18next'

type Props = {
  query: string
  onQueryChange: (query: string) => void
  hideCompleted: boolean
  onHideCompletedChange: (hide: boolean) => void
  sorted: boolean
  sortDirection: 'asc' | 'desc'
  onSortChange: (sorted: boolean, direction: 'asc' | 'desc') => void
}

function TripsControls({
  query,
  onQueryChange,
  hideCompleted,
  onHideCompletedChange,
  sorted,
  sortDirection,
  onSortChange,
}: Props) {
  const { t } = useTranslation('trips')

  function handleSortClick() {
    if (!sorted) onSortChange(true, 'asc')
    else if (sortDirection === 'asc') onSortChange(true, 'desc')
    else onSortChange(false, 'asc')
  }

  const toggleClass = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-md shadow-sm ring-1 transition-colors ${
      active
        ? 'bg-sky-50 text-sky-700 ring-sky-200'
        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
    }`

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
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

      <button
        type="button"
        aria-pressed={hideCompleted}
        aria-label={t('controls.hideCompleted')}
        title={t('controls.hideCompleted')}
        onClick={() => onHideCompletedChange(!hideCompleted)}
        className={toggleClass(hideCompleted)}
      >
        {hideCompleted ? (
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
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
            <path d="m2 2 20 20" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          </svg>
        ) : (
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
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>

      <button
        type="button"
        aria-pressed={sorted}
        aria-label={t('controls.byStatus')}
        title={t('controls.byStatus')}
        onClick={handleSortClick}
        className={toggleClass(sorted)}
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
          className={sorted && sortDirection === 'desc' ? 'rotate-180' : ''}
        >
          <path d="M3 6h11M3 12h7M3 18h5M15 6l3-3 3 3M18 3v18" />
        </svg>
      </button>
    </div>
  )
}

export default TripsControls
