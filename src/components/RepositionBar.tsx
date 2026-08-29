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
    <div className="fixed bottom-safe-6 left-1/2 z-[1000] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-1.5 rounded-2xl bg-white px-4 py-2.5 shadow-lg sm:w-auto sm:flex-row sm:items-center sm:gap-4 sm:rounded-full sm:px-5 sm:py-3">
      <span className="text-sm text-slate-700">
        <Trans
          i18nKey="reposition.hint"
          ns="map"
          values={{ name: placeName }}
          components={[<strong key="name" className="font-medium" />]}
        />
      </span>
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100"
        >
          {t('common:action.cancel')}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasMoved || isSaving}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
        >
          {isSaving ? t('common:action.processing') : t('common:action.save')}
        </button>
      </div>
    </div>
  )
}

export default RepositionBar
