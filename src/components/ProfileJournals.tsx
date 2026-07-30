import { useTranslation } from 'react-i18next'
import { useJournals } from '../hooks/useJournals'
import JournalCard from './JournalCard'
import QueryBoundary from './QueryBoundary'
import ListSkeleton from './ListSkeleton'
import EmptyState from './EmptyState'

function ProfileJournals() {
  const { t } = useTranslation('profile')
  const { data: journals = [], isLoading, isError, error, refetch } = useJournals()

  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={journals.length === 0}
      onRetry={() => void refetch()}
      loading={<ListSkeleton />}
      empty={
        <EmptyState title={t('journalsTab.emptyTitle')} message={t('journalsTab.emptyMessage')} />
      }
    >
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {journals.map((journal) => (
          <li key={journal.id}>
            <JournalCard journal={journal} />
          </li>
        ))}
      </ul>
    </QueryBoundary>
  )
}

export default ProfileJournals
