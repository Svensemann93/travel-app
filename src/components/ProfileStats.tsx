import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import StatTile from './StatTile'
import { usePlaces } from '../hooks/usePlaces'
import { useTrips } from '../hooks/useTrips'
import { useJournals } from '../hooks/useJournals'
import { useWishlist } from '../hooks/useWishlist'
import { distinctCountryCount } from '../lib/profileStats'

function Icon({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </svg>
  )
}

const globe = (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
)
const pin = (
  <Icon>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
)
const map = (
  <Icon>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </Icon>
)
const book = (
  <Icon>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Icon>
)
const star = (
  <Icon>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
)

function ProfileStats() {
  const { t } = useTranslation('profile')
  const { data: places = [] } = usePlaces()
  const { data: trips = [] } = useTrips()
  const { data: journals = [] } = useJournals()
  const { data: wishlist = [] } = useWishlist()

  const tiles = useMemo(
    () => [
      { label: t('stats.countries'), value: distinctCountryCount(places), icon: globe },
      { label: t('stats.places'), value: places.length, icon: pin },
      { label: t('stats.trips'), value: trips.length, icon: map },
      { label: t('stats.journals'), value: journals.length, icon: book },
      { label: t('stats.wishlist'), value: wishlist.length, icon: star },
    ],
    [t, places, trips, journals, wishlist],
  )

  return (
    <div className="flex flex-wrap gap-3">
      {tiles.map((tile) => (
        <StatTile key={tile.label} icon={tile.icon} label={tile.label} value={String(tile.value)} />
      ))}
    </div>
  )
}

export default ProfileStats
