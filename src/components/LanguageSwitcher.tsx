import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'de', labelKey: 'language.german' },
  { code: 'en', labelKey: 'language.english' },
] as const

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    void i18n.changeLanguage(event.target.value)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <label htmlFor="language-select" className="block text-sm font-medium text-slate-500 mb-2">
        {t('language.label')}
      </label>
      <select
        id="language-select"
        value={i18n.resolvedLanguage ?? 'de'}
        onChange={handleChange}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(lang.labelKey)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSwitcher
