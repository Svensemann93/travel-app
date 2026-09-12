import { useTranslation } from 'react-i18next'
import type { ShowcaseTheme } from '../lib/showcasePoints'

const THEMES: ShowcaseTheme[] = ['all', 'visited', 'wishlist', 'planned']

type Props = { active: ShowcaseTheme; onSelect: (theme: ShowcaseTheme) => void }

function ProfileMapThemes({ active, onSelect }: Props) {
  const { t } = useTranslation('profile')

  return (
    <div className="flex sm:justify-end">
      <div className="flex w-full gap-1 rounded-md bg-slate-100 p-1 sm:w-auto">
        {THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            onClick={() => onSelect(theme)}
            aria-pressed={theme === active}
            className={`flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:flex-none sm:px-3 ${
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
