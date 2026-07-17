import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/AppHeader'
import JournalCard from '../components/JournalCard'
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
      type="button"
      onClick={() => setIsCreateOpen(true)}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
    >
      {t('new')}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl p-6 sm:p-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sky-600">{t('eyebrow')}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
            <p className="mt-2 text-slate-500">{t('subtitle')}</p>
          </div>
          {journals.length > 0 && newJournalButton}
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
          <ul className="grid gap-6 md:grid-cols-2">
            {journals.map((journal) => (
              <li key={journal.id}>
                <JournalCard journal={journal} />
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
