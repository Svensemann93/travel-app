import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from './ConfirmDialog'
import JournalEntryModal from './JournalEntryModal'
import type { JournalEntrySavePayload } from './JournalEntryModal'
import JournalEntryListItem from './JournalEntryListItem'
import { useAddEntry, useDeleteEntry, useUpdateEntry } from '../hooks/useJournals'
import type { JournalEntryWithPlace } from '../types/journal'

type Props = {
  journalId: string
  entries: JournalEntryWithPlace[]
}

function JournalEntriesSection({ journalId, entries }: Props) {
  const { t } = useTranslation(['entries', 'common'])
  const addEntry = useAddEntry()
  const updateEntry = useUpdateEntry()
  const deleteEntry = useDeleteEntry()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<JournalEntryWithPlace | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleSave(payload: JournalEntrySavePayload) {
    if (editing) {
      updateEntry.mutate({
        entryId: editing.id,
        journalId,
        data: payload.data,
        photos: payload.newPhotos,
        photosToDelete: payload.photosToDelete,
        photoStartPosition: payload.photoStartPosition,
      })
    } else {
      addEntry.mutate({ journalId, data: payload.data, photos: payload.newPhotos })
    }
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:justify-end">
        <Link
          to={`/journal/${journalId}/lesen`}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 md:w-auto"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 shrink-0 translate-y-px"
            aria-hidden="true"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>{' '}
          <span>{t('readMode')}</span>
        </Link>
        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 md:w-auto"
        >
          {t('new')}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
          {t('empty')}
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <JournalEntryListItem
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditing(entry)
                setModalOpen(true)
              }}
              onDelete={() => setDeletingId(entry.id)}
            />
          ))}
        </ul>
      )}

      <JournalEntryModal
        key={editing ? `entry-${editing.id}` : modalOpen ? 'entry-new' : 'entry-closed'}
        isOpen={modalOpen}
        mode={editing ? 'edit' : 'create'}
        initialData={
          editing
            ? {
                entry_date: editing.entry_date ?? '',
                title: editing.title ?? '',
                body: editing.body ?? '',
                place_id: editing.place_id,
                photos: editing.photos,
                place_photos: editing.place?.photos ?? [],
                place_photo_ids: editing.place_photo_ids,
              }
            : undefined
        }
        isSaving={addEntry.isPending || updateEntry.isPending}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        title={t('deleteTitle')}
        message={t('deleteMessage')}
        confirmLabel={t('common:action.delete')}
        cancelLabel={t('common:action.cancel')}
        isProcessing={deleteEntry.isPending}
        onConfirm={() => {
          if (deletingId) deleteEntry.mutate({ entryId: deletingId, journalId })
          setDeletingId(null)
        }}
        onCancel={() => setDeletingId(null)}
      />
    </>
  )
}

export default JournalEntriesSection
