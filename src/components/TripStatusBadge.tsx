import { useTranslation } from 'react-i18next'
import type { TripStatus } from '../lib/tripStatus'

const STYLES: Record<TripStatus, string> = {
  planning: 'bg-amber-500/90 text-white',
  upcoming: 'bg-blue-600/90 text-white',
  ongoing: 'bg-emerald-600/90 text-white',
  completed: 'bg-slate-700/80 text-white',
}

function TripStatusBadge({ status }: { status: TripStatus }) {
  const { t } = useTranslation('trips')
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${STYLES[status]}`}
    >
      {t(`status.${status}`)}
    </span>
  )
}

export default TripStatusBadge
