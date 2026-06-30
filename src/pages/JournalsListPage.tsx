import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/AppHeader'
import JournalFormModal from '../components/JournalFormModal'
import QueryBoundary from '../components/QueryBoundary'
import ListSkeleton from '../components/ListSkeleton'
import EmptyState from '../components/EmptyState'
import { useCreateJournal, useJournals } from '../hooks/useJournals'
import type { JournalInput } from '../types/journal'

function JournalsListPage() {
  const { t } = useTranslation('journals')
  const { data: journals = [], isLoading, isError, error, refetch } = useJournals()
  const createJournal = useCreateJournal()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  async function handleCreate(data: JournalInput) {
    await createJournal.mutateAsync(data)
    setIsCreateOpen(false)
  }

  const newJournalButton = (
    <button
      onClick={() => setIsCreateOpen(true)}
      className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
    >
      {t('new')}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-4xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{t('title')}</h2>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            {t('new')}
          </button>
        </div>

        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={journals.length === 0}
          onRetry={() => void refetch()}
          loading={<ListSkeleton />}
          empty={
            <EmptyState
              title={t('empty.title')}
              message={t('empty.message')}
              action={newJournalButton}
            />
          }
        >
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
        </QueryBoundary>
      </main>

      <JournalFormModal
        key={isCreateOpen ? 'create-open' : 'create-closed'}
        isOpen={isCreateOpen}
        mode="create"
        isSaving={createJournal.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
      />
    </div>
  )
}

export default JournalsListPage
