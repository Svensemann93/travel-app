import { useTranslation } from 'react-i18next'

function MapEmptyState({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation(['map', 'common'])
  return (
    <div className="pointer-events-none absolute left-1/2 top-20 z-[1100] w-[calc(100%-24px)] max-w-md -translate-x-1/2">
      <div className="pointer-events-auto relative rounded-lg bg-white/95 px-6 py-4 text-center shadow-lg">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common:action.close')}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
        <h3 className="mb-1 font-semibold text-slate-800">{t('empty.title')}</h3>
        <p className="text-sm text-slate-600">{t('empty.message')}</p>
      </div>
    </div>
  )
}

export default MapEmptyState
