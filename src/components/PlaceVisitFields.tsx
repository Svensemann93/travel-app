import { useTranslation } from 'react-i18next'
import PriceLevel from './PriceLevel'
import StarRating from './StarRating'
import CollapsibleSection from './CollapsibleSection'
import type { PlaceFormApi } from '../hooks/usePlaceForm'

type Props = {
  form: PlaceFormApi
}

function PlaceVisitFields({ form }: Props) {
  const { t } = useTranslation('places')

  return (
    <>
      <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={form.visited}
          onChange={(e) => form.setVisited(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm">
          <span className="block font-medium text-slate-700">{t('form.visited')}</span>
          <span className="block text-slate-500">
            {form.visited ? t('form.visitedHint') : t('form.plannedHint')}
          </span>
        </span>
      </label>

      {form.visited ? (
        <>
          <CollapsibleSection title={t('form.visitedOn')}>
            <input
              id="place-visited-on"
              type="date"
              aria-label={t('form.visitedOn')}
              value={form.visitedOn}
              onChange={(e) => form.setVisitedOn(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">{t('form.visitedOnHint')}</p>
          </CollapsibleSection>

          <CollapsibleSection title={t('form.rating')}>
            <StarRating value={form.rating} onChange={form.setRating} />
          </CollapsibleSection>

          <CollapsibleSection title={t('form.price')}>
            <PriceLevel value={form.priceLevel} onChange={form.setPriceLevel} />
          </CollapsibleSection>
        </>
      ) : null}
    </>
  )
}

export default PlaceVisitFields
