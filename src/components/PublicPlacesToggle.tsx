import { useTranslation } from 'react-i18next'

type Props = {
  enabled: boolean
  onToggle: () => void
  className?: string
}

function PublicPlacesToggle({ enabled, onToggle, className = '' }: Props) {
  const { t } = useTranslation('map')

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={`flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 ${className}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
        aria-hidden="true"
      />
      <span className={enabled ? 'text-slate-800' : 'text-slate-400'}>{t('public.toggle')}</span>
    </button>
  )
}

export default PublicPlacesToggle
