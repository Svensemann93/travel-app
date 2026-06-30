import { useTranslation, Trans } from 'react-i18next'

type Props = {
  placeName: string
  hasMoved: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

function RepositionBar({ placeName, hasMoved, isSaving, onSave, onCancel }: Props) {
  const { t } = useTranslation(['map', 'common'])

  return (
    <div className="absolute bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-4 rounded-full bg-white px-5 py-3 shadow-lg">
      <span className="text-sm text-slate-700">
        <Trans i18nKey="reposition.hint" ns="map" values={{ name: placeName }}>
          Ziehe den Pin von <strong>{placeName}</strong> an die neue Position
        </Trans>
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
        >
          {t('common:action.cancel')}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasMoved || isSaving}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
        >
          {isSaving ? t('common:action.processing') : t('common:action.save')}
        </button>
      </div>
    </div>
  )
}

export default RepositionBar
