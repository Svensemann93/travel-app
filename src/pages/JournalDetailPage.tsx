import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import CoverPicker from '../components/CoverPicker'
import CoverFocusEditor from '../components/CoverFocusEditor'
import JournalFormModal from '../components/JournalFormModal'
import JournalShareSection from '../components/JournalShareSection'
import JournalEntriesSection from '../components/JournalEntriesSection'
import SignedImage from '../components/SignedImage'
import DetailStatus from '../components/DetailStatus'
import {
  useDeleteJournal,
  useJournalWithEntries,
  useSetJournalCover,
  useUpdateJournal,
} from '../hooks/useJournals'
import type { JournalInput } from '../types/journal'

function JournalDetailPage() {
  const { journalId = '' } = useParams<{ journalId: string }>()
  const navigate = useNavigate()
  const { data: journal, isLoading, error, refetch } = useJournalWithEntries(journalId)
  const updateJournal = useUpdateJournal()
  const deleteJournal = useDeleteJournal()
  const setCover = useSetJournalCover()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [focusState, setFocusState] = useState<{ path: string; x: number; y: number } | null>(null)

  async function handleUpdate(data: JournalInput) {
    await updateJournal.mutateAsync({ id: journalId, data })
    setIsEditOpen(false)
  }

  async function handleDelete() {
    await deleteJournal.mutateAsync(journalId)
    navigate('/journal')
  }

  function handlePick(path: string) {
    setIsPickerOpen(false)
    const same = path === journal?.cover_photo_path
    setFocusState({
      path,
      x: same ? (journal?.cover_focus_x ?? 50) : 50,
      y: same ? (journal?.cover_focus_y ?? 50) : 50,
    })
  }

  function openFocusForCurrent() {
    if (!journal?.cover_photo_path) return
    setFocusState({
      path: journal.cover_photo_path,
      x: journal.cover_focus_x ?? 50,
      y: journal.cover_focus_y ?? 50,
    })
  }

  function handleFocusSave(x: number, y: number) {
    if (!focusState) return
    setCover.mutate({ id: journalId, coverPhotoPath: focusState.path, focusX: x, focusY: y })
    setFocusState(null)
  }

  function handleRemoveCover() {
    setCover.mutate({ id: journalId, coverPhotoPath: null, focusX: 50, focusY: 50 })
    setIsPickerOpen(false)
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

        <DetailStatus
          isLoading={isLoading}
          error={error}
          isMissing={!isLoading && !error && !journal}
          onRetry={() => void refetch()}
          notFoundLabel="Tagebuch nicht gefunden"
        />

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
                  onClick={() => setIsEditOpen(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Löschen
                </button>
              </div>
            </div>

            <div className="mb-6">
              {journal.cover_photo_path ? (
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg shadow-sm">
                    <SignedImage
                      path={journal.cover_photo_path}
                      alt="Titelbild"
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${journal.cover_focus_x ?? 50}% ${journal.cover_focus_y ?? 50}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <button
                      onClick={() => setIsPickerOpen(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Titelbild ändern
                    </button>
                    <button
                      onClick={openFocusForCurrent}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ausschnitt anpassen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Titelbild wählen
                </button>
              )}
            </div>

            <JournalShareSection journalId={journalId} />
            <JournalEntriesSection journalId={journalId} entries={journal.journal_entries} />

            <CoverPicker
              isOpen={isPickerOpen}
              journal={journal}
              currentPath={journal.cover_photo_path ?? null}
              onPick={handlePick}
              onRemove={handleRemoveCover}
              onClose={() => setIsPickerOpen(false)}
            />

            {focusState && (
              <CoverFocusEditor
                path={focusState.path}
                focusX={focusState.x}
                focusY={focusState.y}
                onCancel={() => setFocusState(null)}
                onSave={handleFocusSave}
              />
            )}
          </>
        )}
      </main>

      <JournalFormModal
        key={journal ? `edit-${journal.id}` : 'edit-closed'}
        isOpen={isEditOpen}
        initialData={
          journal ? { title: journal.title, description: journal.description ?? '' } : undefined
        }
        isSaving={updateJournal.isPending}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Tagebuch löschen"
        message={`Möchtest du "${journal?.title}" wirklich löschen? Alle Einträge gehen verloren.`}
        confirmLabel="Löschen"
        isProcessing={deleteJournal.isPending}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  )
}

export default JournalDetailPage
