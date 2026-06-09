import { useParams } from 'react-router-dom'
import JournalReadView from '../components/JournalReadView'
import { useSharedJournal } from '../hooks/useSharedJournal'

function JournalSharePage() {
  const { token = '' } = useParams<{ token: string }>()
  const { data: journal, isLoading, error } = useSharedJournal(token)

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        {isLoading && <p className="text-slate-500">Lädt…</p>}
        {error && (
          <p className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
            Dieser Link konnte nicht geladen werden.
          </p>
        )}
        {!isLoading && !error && !journal && (
          <p className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
            Dieser Link ist ungültig oder abgelaufen.
          </p>
        )}
        {journal && <JournalReadView journal={journal} />}
      </main>
    </div>
  )
}

export default JournalSharePage
