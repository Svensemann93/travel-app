import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { formatDate } from '../lib/dateFormat'
import { visiblePlacePhotos } from '../lib/journalPhotos'
import type { JournalEntryWithPlace } from '../types/journal'

type Props = {
  entry: JournalEntryWithPlace
  onEdit: () => void
  onDelete: () => void
}

function JournalEntryListItem({ entry, onEdit, onDelete }: Props) {
  const { t } = useTranslation(['entries', 'common'])
  const placePhotos = visiblePlacePhotos(entry)
  const hasPhotos = placePhotos.length > 0 || entry.photos.length > 0
  const photoAlt = entry.title ? t('photoAlt', { title: entry.title }) : t('photoAltFallback')

  return (
    <li className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {entry.entry_date && (
            <p className="text-xs font-medium text-blue-700">{formatDate(entry.entry_date)}</p>
          )}
          {entry.title && <h3 className="font-semibold text-slate-800">{entry.title}</h3>}
          {entry.body && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{entry.body}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-3">
          <button onClick={onEdit} className="text-sm text-blue-600 hover:underline">
            {t('common:action.edit')}
          </button>
          <button onClick={onDelete} className="text-sm text-red-600 hover:underline">
            {t('common:action.delete')}
          </button>
        </div>
      </div>
      {hasPhotos && (
        <div className="mt-3 flex flex-wrap gap-2">
          {placePhotos.map((photo) => (
            <SignedImage
              key={`place-${photo.id}`}
              path={photo.thumb_url ?? photo.url}
              alt={photoAlt}
              className="h-20 w-20 rounded-md object-cover"
            />
          ))}
          {entry.photos.map((photo) => (
            <SignedImage
              key={`own-${photo.id}`}
              path={photo.thumb_url ?? photo.url}
              alt={photoAlt}
              className="h-20 w-20 rounded-md object-cover"
            />
          ))}
        </div>
      )}
    </li>
  )
}

export default JournalEntryListItem
