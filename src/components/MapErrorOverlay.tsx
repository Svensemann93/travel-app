import { useTranslation } from 'react-i18next'

type Props = {
  onRetry: () => void
}

function MapErrorOverlay({ onRetry }: Props) {
  const { t } = useTranslation(['map', 'common'])
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
      <div
        className="bg-white/95 rounded-lg shadow-lg px-6 py-4 max-w-md text-center pointer-events-auto"
        role="alert"
      >
        <h3 className="font-semibold text-slate-800 mb-1">{t('error.title')}</h3>
        <p className="text-sm text-slate-600 mb-3">{t('error.message')}</p>
        <button onClick={onRetry} className="text-sm font-medium text-blue-600 hover:underline">
          {t('common:state.retry')}
        </button>
      </div>
    </div>
  )
}

export default MapErrorOverlay
