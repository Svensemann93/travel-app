import { useTranslation } from 'react-i18next'
import type { ShowcaseTheme } from '../lib/showcasePoints'

const THEMES: ShowcaseTheme[] = ['all', 'visited', 'wishlist', 'planned']

type Props = { active: ShowcaseTheme; onSelect: (theme: ShowcaseTheme) => void }

function ProfileMapThemes({ active, onSelect }: Props) {
  const { t } = useTranslation('profile')

  return (
    <div className="flex justify-end">
      <div className="flex flex-wrap gap-1 rounded-md bg-slate-100 p-1">
        {THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            onClick={() => onSelect(theme)}
            aria-pressed={theme === active}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              theme === active
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t(`mapThemes.${theme}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileMapThemes
