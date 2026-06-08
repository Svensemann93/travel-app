import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import JournalFormModal from '../components/JournalFormModal'
import { useCreateJournal, useJournals } from '../hooks/useJournals'
import type { JournalInput } from '../types/journal'

function JournalsListPage() {
  const { data: journals = [], isLoading, error } = useJournals()
  const createJournal = useCreateJournal()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  async function handleCreate(data: JournalInput) {
    await createJournal.mutateAsync(data)
    setIsCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-4xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Reisetagebuch</h2>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            + Neues Tagebuch
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-2 h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error.message}
          </div>
        )}

        {!isLoading && journals.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-slate-600">
              Du hast noch kein Tagebuch. Starte deine erste Reisegeschichte!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              + Neues Tagebuch
            </button>
          </div>
        )}

        {journals.length > 0 && (
          <ul className="space-y-3">
            {journals.map((journal) => (
              <li key={journal.id}>
                <Link
                  to={`/journal/${journal.id}`}
                  className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-800">{journal.title}</h3>
                  {journal.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {journal.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <JournalFormModal
        key={isCreateOpen ? 'create-open' : 'create-closed'}
        isOpen={isCreateOpen}
        isSaving={createJournal.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
      />
    </div>
  )
}

export default JournalsListPage
