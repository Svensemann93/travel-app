import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CATEGORIES } from '../lib/categories'
import { useCategoryFilter } from '../contexts/categoryFilter'

type Props = {
  className?: string
}

function CategoryFilter({ className = '' }: Props) {
  const { t } = useTranslation(['common', 'category'])
  const { selected, isSelected, toggle, selectAll, clear, allSelected } = useCategoryFilter()
  const [open, setOpen] = useState(false)

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t('filter.label')}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 md:bg-white md:shadow-sm md:ring-1 md:ring-slate-200 md:hover:bg-slate-50"
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
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="hidden md:inline">{t('filter.button')}</span>
          {!allSelected && (
            <span className="rounded-full bg-blue-600 px-1.5 text-xs font-semibold leading-5 text-white">
              {selected.size}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-[2000]" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-[2001] mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-lg bg-white p-3 shadow-lg ring-1 ring-slate-200">
              <div className="mb-2 flex justify-between border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  {t('filter.selectAll')}
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium text-slate-500 hover:underline"
                >
                  {t('filter.clearAll')}
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => {
                  const active = isSelected(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(cat.id)}
                      className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-slate-50 ${
                        active ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full border"
                        style={{
                          backgroundColor: active ? cat.color : 'transparent',
                          borderColor: cat.color,
                        }}
                      />
                      {t(`category:${cat.id}`)}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CategoryFilter
