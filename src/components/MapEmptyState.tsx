import { useTranslation } from 'react-i18next'

function MapEmptyState() {
  const { t } = useTranslation('map')
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
      <div className="bg-white/95 rounded-lg shadow-lg px-6 py-4 max-w-md text-center">
        <h3 className="font-semibold text-slate-800 mb-1">{t('empty.title')}</h3>
        <p className="text-sm text-slate-600">{t('empty.message')}</p>
      </div>
    </div>
  )
}

export default MapEmptyState
