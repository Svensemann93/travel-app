import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppHeader from '../components/AppHeader'
import JournalReadView from '../components/JournalReadView'
import DetailStatus from '../components/DetailStatus'
import { useJournalWithEntries } from '../hooks/useJournals'

function JournalReadPage() {
  const { t } = useTranslation('read')
  const { journalId = '' } = useParams<{ journalId: string }>()
  const { data: journal, isLoading, error, refetch } = useJournalWithEntries(journalId)

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader sticky />
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Link
          to={`/journal/${journalId}`}
          className="mb-4 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          {t('backToEditing')}
        </Link>

        <DetailStatus
          isLoading={isLoading}
          error={error}
          isMissing={!isLoading && !error && !journal}
          onRetry={() => void refetch()}
          notFoundLabel={t('notFound')}
        />

        {journal && <JournalReadView journal={journal} stickyHeader />}
      </main>
    </div>
  )
}

export default JournalReadPage
