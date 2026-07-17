import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { useFormatDate } from '../hooks/useFormatDate'
import type { Journal } from '../types/journal'

type Props = {
  journal: Journal
}

function JournalCard({ journal }: Props) {
  const { t } = useTranslation('journals')
  const { formatDate } = useFormatDate()
  const coverPosition = `${journal.cover_focus_x ?? 50}% ${journal.cover_focus_y ?? 50}%`

  return (
    <Link
      to={`/journal/${journal.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 transition-shadow hover:shadow-md"
    >
      {journal.cover_photo_path ? (
        <SignedImage
          path={journal.cover_photo_path}
          alt=""
          className="h-44 w-full object-cover sm:h-56"
          style={{ objectPosition: coverPosition }}
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-100 sm:h-56">
          <img src="/logo.png" alt="" className="h-16 w-auto opacity-70" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">{journal.title}</h3>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="mt-1 shrink-0 text-blue-600 transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>

        {journal.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {journal.description}
          </p>
        )}

        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          {t('updatedAt', { date: formatDate(journal.updated_at) })}
        </p>
      </div>
    </Link>
  )
}

export default JournalCard
