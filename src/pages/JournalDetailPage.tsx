import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import JournalFormModal from '../components/JournalFormModal'
import JournalShareSection from '../components/JournalShareSection'
import JournalEntriesSection from '../components/JournalEntriesSection'
import { useDeleteJournal, useJournalWithEntries, useUpdateJournal } from '../hooks/useJournals'
import type { JournalInput } from '../types/journal'

function JournalDetailPage() {
  const { journalId = '' } = useParams<{ journalId: string }>()
  const navigate = useNavigate()
  const { data: journal, isLoading, error } = useJournalWithEntries(journalId)
  const updateJournal = useUpdateJournal()
  const deleteJournal = useDeleteJournal()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  async function handleUpdate(data: JournalInput) {
    await updateJournal.mutateAsync({ id: journalId, data })
    setIsEditOpen(false)
  }

  async function handleDelete() {
    await deleteJournal.mutateAsync(journalId)
    navigate('/journal')
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

            <JournalShareSection journalId={journalId} />
            <JournalEntriesSection journalId={journalId} entries={journal.journal_entries} />
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
