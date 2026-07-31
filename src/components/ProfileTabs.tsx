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
  '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors'

type Props = { active: ProfileTab; onSelect: (tab: ProfileTab) => void }

function ProfileTabs({ active, onSelect }: Props) {
  const { t } = useTranslation('profile')

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200">
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
  )
}

export default ProfileTabs
