import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export type ProfileTab = 'highlights' | 'pins' | 'journals' | 'map' | 'about'

const TABS: { key: ProfileTab; enabled: boolean }[] = [
  { key: 'highlights', enabled: false },
  { key: 'pins', enabled: false },
  { key: 'journals', enabled: true },
  { key: 'map', enabled: true },
  { key: 'about', enabled: true },
]

const base =
  '-mb-px flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors'

type Props = { active: ProfileTab; onSelect: (tab: ProfileTab) => void }

function ProfileTabs({ active, onSelect }: Props) {
  const { t } = useTranslation('profile')
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const button = activeRef.current
    if (!container || !button) return
    const left = button.offsetLeft - (container.clientWidth - button.clientWidth) / 2
    container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [active])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex snap-x gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible"
      >
        {TABS.map((tab) => {
          const isActive = tab.enabled && tab.key === active
          const state = isActive
            ? 'border-[#39BBDE] text-slate-900'
            : tab.enabled
              ? 'border-transparent text-slate-500 hover:text-slate-700'
              : 'cursor-not-allowed border-transparent text-slate-400'
          return (
            <button
              key={tab.key}
              ref={isActive ? activeRef : undefined}
              type="button"
              disabled={!tab.enabled}
              onClick={() => onSelect(tab.key)}
              className={`${base} ${state}`}
            >
              {t(`tabs.${tab.key}`)}
              {!tab.enabled && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {t('tabs.soon')}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 to-transparent sm:hidden" />
    </div>
  )
}

export default ProfileTabs
