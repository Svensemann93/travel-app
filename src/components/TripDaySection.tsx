import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'
import SortableTripPlaceItem from './SortableTripPlaceItem'
import { useFormatDate } from '../hooks/useFormatDate'
import type { DayGroup } from '../lib/tripDays'
import type { TripPlaceWithPlace } from '../types/trip'

type Props = {
  group: DayGroup
  isTarget: boolean
  isToday: boolean
  isOpen: boolean
  onToggle: () => void
  dayNumber: number | null
  numberOf: (placeId: string) => number
  removingPlaceId: string | null
  onSelectPlace: (placeId: string) => void
  onEditPlace: (tripPlace: TripPlaceWithPlace) => void
  onRemovePlace: (placeId: string) => void
}

function TripDaySection({
  group,
  isTarget,
  isToday,
  isOpen,
  onToggle,
  dayNumber,
  numberOf,
  removingPlaceId,
  onSelectPlace,
  onEditPlace,
  onRemovePlace,
}: Props) {
  const { t } = useTranslation('trips')
  const { formatDate } = useFormatDate()
  const { setNodeRef } = useDroppable({ id: group.id })

  const title = group.date
    ? `${t('days.day', { number: dayNumber })} · ${formatDate(group.date)}`
    : t('days.unplanned')

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl ring-1 transition-colors ${
        isTarget ? 'bg-blue-50 ring-blue-400' : 'bg-slate-50/70 ring-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          {isToday && (
            <span className="rounded-full bg-[#39BBDE]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1c7f9b]">
              {t('days.today')}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {t('placeCount', { count: group.places.length })}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-2 pb-2">
          <SortableContext
            items={group.places.map((tp) => tp.place_id)}
            strategy={verticalListSortingStrategy}
          >
            {group.places.length === 0 ? (
              <p
                className={`flex min-h-16 items-center justify-center rounded-lg border border-dashed px-2 text-sm ${
                  isTarget ? 'border-blue-400 text-blue-500' : 'border-slate-300 text-slate-400'
                }`}
              >
                {t('days.empty')}
              </p>
            ) : (
              <ul className="space-y-2">
                {group.places.map((tp) => (
                  <li key={tp.place_id}>
                    <SortableTripPlaceItem
                      id={tp.place_id}
                      place={tp.place}
                      number={numberOf(tp.place_id)}
                      plannedDate={null}
                      notes={tp.notes}
                      onSelect={() => onSelectPlace(tp.place_id)}
                      onEdit={() => onEditPlace(tp)}
                      onRemove={() => onRemovePlace(tp.place_id)}
                      isRemoving={removingPlaceId === tp.place_id}
                      hideWhileDragging
                    />
                  </li>
                ))}
              </ul>
            )}
          </SortableContext>
        </div>
      )}
    </section>
  )
}

export default TripDaySection
