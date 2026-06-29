import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import JournalReadView from '../components/JournalReadView'
import { useSharedJournal } from '../hooks/useSharedJournal'

function StateCard({
  title,
  message,
  role,
}: {
  title: string
  message: string
  role?: 'status' | 'alert'
}) {
  return (
    <div
      className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 text-center shadow-sm"
      role={role}
    >
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </div>
  )
}

function JournalSharePage() {
  const { t } = useTranslation('read')
  const { token = '' } = useParams<{ token: string }>()
  const { data: journal, isLoading, error } = useSharedJournal(token)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-8">
        {isLoading && (
          <p className="mt-16 text-center text-slate-500" role="status">
            {t('share.loading')}
          </p>
        )}
        {error && (
          <StateCard title={t('share.errorTitle')} message={t('share.errorMessage')} role="alert" />
        )}
        {!isLoading && !error && !journal && (
          <StateCard
            title={t('share.unavailableTitle')}
            message={t('share.unavailableMessage')}
            role="alert"
          />
        )}
        {journal && <JournalReadView journal={journal} />}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          <img src="/logo.png" alt="" className="h-5 w-auto opacity-70" />
          {t('share.madeWith')}
        </Link>
      </footer>
    </div>
  )
}

export default JournalSharePage
