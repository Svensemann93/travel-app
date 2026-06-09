import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import JournalFormModal from '../components/JournalFormModal'
import JournalEntryModal from '../components/JournalEntryModal'
import type { JournalEntrySavePayload } from '../components/JournalEntryModal'
import SignedImage from '../components/SignedImage'
import {
  useAddEntry,
  useDeleteEntry,
  useDeleteJournal,
  useJournalWithEntries,
  useUpdateEntry,
  useUpdateJournal,
} from '../hooks/useJournals'
import { formatDate } from '../lib/dateFormat'
import { visiblePlacePhotos } from '../lib/journalPhotos'
import type { JournalEntryWithPlace, JournalInput } from '../types/journal'

function JournalDetailPage() {
  const { journalId = '' } = useParams<{ journalId: string }>()
  const navigate = useNavigate()
  const { data: journal, isLoading, error } = useJournalWithEntries(journalId)
  const updateJournal = useUpdateJournal()
  const deleteJournal = useDeleteJournal()
  const addEntry = useAddEntry()
  const updateEntry = useUpdateEntry()
  const deleteEntry = useDeleteEntry()

  const [isEditJournalOpen, setIsEditJournalOpen] = useState(false)
  const [isDeleteJournalOpen, setIsDeleteJournalOpen] = useState(false)
  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntryWithPlace | null>(null)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)

  async function handleUpdateJournal(data: JournalInput) {
    await updateJournal.mutateAsync({ id: journalId, data })
    setIsEditJournalOpen(false)
  }

  async function handleDeleteJournal() {
    await deleteJournal.mutateAsync(journalId)
    navigate('/journal')
  }

  function handleSaveEntry(payload: JournalEntrySavePayload) {
    if (editingEntry) {
      updateEntry.mutate({
        entryId: editingEntry.id,
        journalId,
        data: payload.data,
        photos: payload.newPhotos,
        photosToDelete: payload.photosToDelete,
        photoStartPosition: payload.photoStartPosition,
      })
    } else {
      addEntry.mutate({ journalId, data: payload.data, photos: payload.newPhotos })
    }
    setEntryModalOpen(false)
    setEditingEntry(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-3xl p-4 md:p-8">
        <Link
          to="/journal"
          className="mb-4 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          ← Zurück zu meinen Tagebüchern
        </Link>

        {isLoading && <p className="text-slate-500">Lädt…</p>}
        {error && <p className="text-red-700">{error.message}</p>}
        {!isLoading && !error && !journal && (
          <p className="text-slate-500">Tagebuch nicht gefunden.</p>
        )}

        {journal && (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{journal.title}</h1>
                {journal.description && (
                  <p className="mt-1 text-slate-600">{journal.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setIsEditJournalOpen(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => setIsDeleteJournalOpen(true)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Löschen
                </button>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-start gap-2 md:justify-end">
              <Link
                to={`/journal/${journalId}/lesen`}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                Lesemodus
              </Link>
              <button
                onClick={() => {
                  setEditingEntry(null)
                  setEntryModalOpen(true)
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                + Neuer Eintrag
              </button>
            </div>

            {journal.journal_entries.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
                Noch keine Einträge. Halte deinen ersten Moment fest!
              </div>
            ) : (
              <ul className="space-y-3">
                {journal.journal_entries.map((entry) => {
                  const placePhotos = visiblePlacePhotos(entry)
                  const hasPhotos = placePhotos.length > 0 || entry.photos.length > 0
                  return (
                    <li key={entry.id} className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {entry.entry_date && (
                            <p className="text-xs font-medium text-blue-700">
                              {formatDate(entry.entry_date)}
                            </p>
                          )}
                          {entry.title && (
                            <h3 className="font-semibold text-slate-800">{entry.title}</h3>
                          )}
                          {entry.body && (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                              {entry.body}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-3">
                          <button
                            onClick={() => {
                              setEditingEntry(entry)
                              setEntryModalOpen(true)
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => setDeletingEntryId(entry.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                      {hasPhotos && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {placePhotos.map((photo) => (
                            <SignedImage
                              key={`place-${photo.id}`}
                              path={photo.thumb_url ?? photo.url}
                              alt=""
                              className="h-20 w-20 rounded-md object-cover"
                            />
                          ))}
                          {entry.photos.map((photo) => (
                            <SignedImage
                              key={`own-${photo.id}`}
                              path={photo.thumb_url ?? photo.url}
                              alt=""
                              className="h-20 w-20 rounded-md object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </main>

      <JournalFormModal
        key={journal ? `edit-${journal.id}` : 'edit-closed'}
        isOpen={isEditJournalOpen}
        initialData={
          journal ? { title: journal.title, description: journal.description ?? '' } : undefined
        }
        isSaving={updateJournal.isPending}
        onClose={() => setIsEditJournalOpen(false)}
        onSave={handleUpdateJournal}
      />

      <JournalEntryModal
        key={
          editingEntry ? `entry-${editingEntry.id}` : entryModalOpen ? 'entry-new' : 'entry-closed'
        }
        isOpen={entryModalOpen}
        initialData={
          editingEntry
            ? {
                entry_date: editingEntry.entry_date ?? '',
                title: editingEntry.title ?? '',
                body: editingEntry.body ?? '',
                place_id: editingEntry.place_id,
                photos: editingEntry.photos,
                place_photos: editingEntry.place?.photos ?? [],
                place_photo_ids: editingEntry.place_photo_ids,
              }
            : undefined
        }
        isSaving={addEntry.isPending || updateEntry.isPending}
        onClose={() => {
          setEntryModalOpen(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveEntry}
      />

      <ConfirmDialog
        isOpen={isDeleteJournalOpen}
        title="Tagebuch löschen"
        message={`Möchtest du "${journal?.title}" wirklich löschen? Alle Einträge gehen verloren.`}
        confirmLabel="Löschen"
        isProcessing={deleteJournal.isPending}
        onConfirm={handleDeleteJournal}
        onCancel={() => setIsDeleteJournalOpen(false)}
      />

      <ConfirmDialog
        isOpen={deletingEntryId !== null}
        title="Eintrag löschen"
        message="Diesen Eintrag wirklich löschen?"
        confirmLabel="Löschen"
        isProcessing={deleteEntry.isPending}
        onConfirm={() => {
          if (deletingEntryId) deleteEntry.mutate({ entryId: deletingEntryId, journalId })
          setDeletingEntryId(null)
        }}
        onCancel={() => setDeletingEntryId(null)}
      />
    </div>
  )
}

export default JournalDetailPage
