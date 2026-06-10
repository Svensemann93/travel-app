import { Link, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import JournalReadView from '../components/JournalReadView'
import { useJournalWithEntries } from '../hooks/useJournals'

function JournalReadPage() {
  const { journalId = '' } = useParams<{ journalId: string }>()
  const { data: journal, isLoading, error } = useJournalWithEntries(journalId)

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader sticky />
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Link
          to={`/journal/${journalId}`}
          className="mb-4 inline-block text-sm text-slate-600 hover:text-slate-900"
        >
          ← Zurück zur Bearbeitung
        </Link>

        {isLoading && <p className="text-slate-500">Lädt…</p>}
        {error && <p className="text-red-700">{error.message}</p>}
        {!isLoading && !error && !journal && (
          <p className="text-slate-500">Tagebuch nicht gefunden.</p>
        )}

        {journal && <JournalReadView journal={journal} stickyHeader />}
      </main>
    </div>
  )
}

export default JournalReadPage
