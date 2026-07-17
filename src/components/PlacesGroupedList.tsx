import { useTranslation } from 'react-i18next'
import CountrySection from './CountrySection'
import PlaceListItem from './PlaceListItem'
import type { CountryGroup } from '../lib/groupByCountry'
import type { Place } from '../types/place'

type Props = {
  groups: CountryGroup<Place>[]
  grouped: boolean
  collapsed: ReadonlySet<string>
  onToggleGroup: (key: string) => void
  onPlaceClick: (placeId: string) => void
}

function PlacesGroupedList({ groups, grouped, collapsed, onToggleGroup, onPlaceClick }: Props) {
  const { t } = useTranslation('places')

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const key = group.code ?? 'none'
        const list = (
          <ul className="space-y-3">
            {group.items.map((place) => (
              <li key={place.id}>
                <PlaceListItem place={place} onClick={onPlaceClick} />
              </li>
            ))}
          </ul>
        )

        if (!grouped) return <div key={key}>{list}</div>

        return (
          <CountrySection
            key={key}
            name={group.name || t('noCountry')}
            count={group.items.length}
            isOpen={!collapsed.has(key)}
            onToggle={() => onToggleGroup(key)}
          >
            {list}
          </CountrySection>
        )
      })}
    </div>
  )
}

export default PlacesGroupedList
