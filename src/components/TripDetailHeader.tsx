import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'

type Props = {
  name: string
  description: string | null
  dateRange: string | null
  coverPhotoPath: string | null
  coverFocusX: number
  coverFocusY: number
  onChangeCover: () => void
  onAdjustCover: () => void
  onEdit: () => void
  onDelete: () => void
  onCreateJournal: () => void
}

function TripDetailHeader({
  name,
  description,
  dateRange,
  coverPhotoPath,
  coverFocusX,
  coverFocusY,
  onChangeCover,
  onAdjustCover,
  onEdit,
  onDelete,
  onCreateJournal,
}: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const coverPosition = `${coverFocusX}% ${coverFocusY}%`

  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
      {coverPhotoPath ? (
        <div className="group relative h-44 w-full sm:h-56">
          <SignedImage
            path={coverPhotoPath}
            alt={t('cover.alt')}
            className="h-full w-full object-cover"
            style={{ objectPosition: coverPosition }}
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            <button
              type="button"
              onClick={onAdjustCover}
              className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white"
            >
              {t('cover.adjust')}
            </button>
            <button
              type="button"
              onClick={onChangeCover}
              className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white"
            >
              {t('cover.change')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onChangeCover}
          className="flex h-24 w-full items-center justify-center gap-2 bg-gradient-to-b from-sky-100 to-emerald-100 text-sm font-medium text-slate-600 hover:from-sky-200 hover:to-emerald-200"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          {t('cover.button')}
        </button>
      )}

      <div className="p-6">
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
            <button
              type="button"
              onClick={onEdit}
              className="text-sm text-blue-600 hover:underline"
            >
              {t('common:action.edit')}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-red-600 hover:underline"
            >
              {t('common:action.delete')}
            </button>
          </div>
        </div>
        {dateRange && <p className="mb-2 text-sm text-slate-500">{dateRange}</p>}
        {description && <p className="mt-2 whitespace-pre-line text-slate-600">{description}</p>}
      </div>
    </div>
  )
}

export default TripDetailHeader
