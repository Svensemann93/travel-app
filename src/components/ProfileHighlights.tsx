import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaces } from '../hooks/usePlaces'
import { useJournals } from '../hooks/useJournals'
import { buildActivity } from '../lib/profileActivity'
import type { ProfileTab } from './ProfileTabs'
import ProfileActivityItem from './ProfileActivityItem'
import ProfileHighlightPin from './ProfileHighlightPin'
import JournalCard from './JournalCard'
import EmptyState from './EmptyState'
import ProfileSectionHeading from './ProfileSectionHeading'

type Props = { onSelectTab: (tab: ProfileTab) => void }

function ProfileHighlights({ onSelectTab }: Props) {
  const { t } = useTranslation('profile')
  const { data: places = [] } = usePlaces()
  const { data: journals = [] } = useJournals()

  const activity = useMemo(() => buildActivity(places, journals), [places, journals])

  const latestPins = useMemo(
    () =>
      places
        .slice()
        .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
        .slice(0, 4),
    [places],
  )

  const latestJournals = useMemo(() => journals.slice(0, 2), [journals])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <ProfileSectionHeading
          title={t('highlightsTab.activity')}
          onShowAll={() => onSelectTab('pins')}
        />
        {activity.length === 0 ? (
          <p className="px-2 py-4 text-sm text-slate-400">{t('highlightsTab.activityEmpty')}</p>
        ) : (
          <ul className="space-y-1">
            {activity.map((item) => (
              <li key={item.id}>
                <ProfileActivityItem item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="space-y-6">
        <section>
          <ProfileSectionHeading
            title={t('highlightsTab.latestPins')}
            onShowAll={() => onSelectTab('pins')}
          />
          {latestPins.length === 0 ? (
            <EmptyState message={t('highlightsTab.pinsEmpty')} />
          ) : (
            <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {latestPins.map((place) => (
                <li key={place.id}>
                  <ProfileHighlightPin place={place} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <ProfileSectionHeading
            title={t('highlightsTab.latestJournals')}
            onShowAll={() => onSelectTab('journals')}
          />
          {latestJournals.length === 0 ? (
            <EmptyState message={t('highlightsTab.journalsEmpty')} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {latestJournals.map((journal) => (
                <li key={journal.id}>
                  <JournalCard journal={journal} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default ProfileHighlights
