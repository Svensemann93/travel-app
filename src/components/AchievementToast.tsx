import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { useTrips } from '../hooks/useTrips'
import { useJournals } from '../hooks/useJournals'
import { computeTravelStats } from '../lib/travelStats'
import { ACHIEVEMENTS } from '../lib/achievements'
import { STAMP_ICONS } from '../lib/stampIcons'
import { loadSeen, saveSeen } from '../lib/achievementsSeen'
import PassportStamp from './PassportStamp'

function AchievementToast() {
  const { t } = useTranslation('pass')
  const { data: places } = usePlaces()
  const { data: trips } = useTrips()
  const { data: journals } = useJournals()
  const [queue, setQueue] = useState<string[]>([])

  const earnedIds = useMemo(() => {
    if (!places || !trips || !journals) return null
    const stats = computeTravelStats(places, trips.length, journals.length)
    return ACHIEVEMENTS.filter((a) => a.earned(stats)).map((a) => a.id)
  }, [places, trips, journals])

  useEffect(() => {
    if (!earnedIds) return
    const seen = loadSeen()
    if (seen === null) {
      saveSeen(earnedIds)
      return
    }
    const earnedSet = new Set<string>(earnedIds)
    const stillEarned = seen.filter((id) => earnedSet.has(id))
    const fresh = earnedIds.filter((id) => !seen.includes(id))
    if (fresh.length > 0) {
      saveSeen([...stillEarned, ...fresh])
      queueMicrotask(() => setQueue((q) => [...q, ...fresh]))
    } else if (stillEarned.length !== seen.length) {
      saveSeen(stillEarned)
    }
  }, [earnedIds])

  useEffect(() => {
    if (queue.length === 0) return
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), 5000)
    return () => clearTimeout(timer)
  }, [queue])

  const current = queue[0] ? ACHIEVEMENTS.find((a) => a.id === queue[0]) : undefined
  if (!current) return null

  return (
    <div className="fixed top-20 right-4 z-[2000] flex w-72 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="h-16 w-16 shrink-0">
        <PassportStamp
          id={`toast-${current.id}`}
          icon={STAMP_ICONS[current.icon]}
          title={t(`achievements.${current.id}.title`)}
          ink={current.ink}
          earned
          progressText=""
          caption={t('earned')}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{t('toast.title')}</p>
        <p className="truncate text-sm text-slate-600">{t(`achievements.${current.id}.title`)}</p>
      </div>
      <button
        type="button"
        onClick={() => setQueue((q) => q.slice(1))}
        aria-label={t('toast.dismiss')}
        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default AchievementToast
