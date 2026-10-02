import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SignedImage from './SignedImage'
import { useFormatDate } from '../hooks/useFormatDate'
import type { ActivityItem } from '../lib/profileActivity'

const TINTS: Record<ActivityItem['kind'], string> = {
  place: 'bg-slate-100 text-slate-500',
  public_place: 'bg-amber-50 text-amber-600',
  journal: 'bg-sky-50 text-sky-600',
  photos: 'bg-emerald-50 text-emerald-600',
}

const ICONS: Record<ActivityItem['kind'], string> = {
  place: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
  public_place: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
  journal: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  photos: 'M4 5h16v14H4zM8 11l3 3 2-2 3 4H7z',
}

function ProfileActivityItem({ item }: { item: ActivityItem }) {
  const { t } = useTranslation('profile')
  const { formatRelative } = useFormatDate()

  return (
    <Link
      to={item.to}
      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TINTS[item.kind]}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={ICONS[item.kind]} />
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs text-slate-400">{t(`activity.kind.${item.kind}`)}</span>
        <span className="block truncate text-sm font-medium text-slate-800">{item.title}</span>
        <span className="block text-xs text-slate-400">{formatRelative(item.at)}</span>
      </span>

      {item.photoPath && (
        <span className="relative shrink-0">
          <SignedImage path={item.photoPath} alt="" className="h-12 w-16 rounded-md object-cover" />
          {item.extraPhotos > 0 && (
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/45 text-xs font-medium text-white">
              +{item.extraPhotos}
            </span>
          )}
        </span>
      )}
    </Link>
  )
}

export default ProfileActivityItem
