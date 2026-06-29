import { useTranslation } from 'react-i18next'

type Props = {
  name: string
  description: string | null
  dateRange: string | null
  onEdit: () => void
  onDelete: () => void
  onCreateJournal: () => void
}

function TripDetailHeader({
  name,
  description,
  dateRange,
  onEdit,
  onDelete,
  onCreateJournal,
}: Props) {
  const { t } = useTranslation(['trips', 'common'])

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <div className="flex flex-shrink-0 gap-3">
          <button
            type="button"
            onClick={onCreateJournal}
            className="text-sm text-emerald-600 hover:underline"
          >
            {t('createJournal')}
          </button>
          <button type="button" onClick={onEdit} className="text-sm text-blue-600 hover:underline">
            {t('common:action.edit')}
          </button>
          <button type="button" onClick={onDelete} className="text-sm text-red-600 hover:underline">
            {t('common:action.delete')}
          </button>
        </div>
      </div>
      {dateRange && <p className="mb-2 text-sm text-slate-500">{dateRange}</p>}
      {description && <p className="mt-2 whitespace-pre-line text-slate-600">{description}</p>}
    </div>
  )
}

export default TripDetailHeader
