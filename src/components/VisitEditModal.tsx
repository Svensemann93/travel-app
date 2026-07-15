import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import StarRating from './StarRating'
import PriceLevel from './PriceLevel'
import type { PublicPlace } from '../types/place'

type Props = {
  place: PublicPlace
  onClose: () => void
  onSave: (
    placeId: string,
    rating: number | null,
    priceLevel: number | null,
    visitedOn: string | null,
  ) => void
  onRemove: (placeId: string) => void
  isSaving: boolean
}

function VisitEditModal({ place, onClose, onSave, onRemove, isSaving }: Props) {
  const { t } = useTranslation(['map', 'common'])
  const [rating, setRating] = useState<number | null>(place.my_rating)
  const [price, setPrice] = useState<number | null>(place.my_price)
  const [visitedOn, setVisitedOn] = useState(place.my_visited_on ?? '')

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
      >
        {t('common:action.cancel')}
      </button>
      <button
        type="button"
        onClick={() => onSave(place.id, rating || null, price || null, visitedOn || null)}
        disabled={isSaving}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('common:action.save')}
      </button>
    </div>
  )

  return (
    <Modal isOpen onClose={onClose} maxWidth="sm" footer={footer}>
      <h2 className="text-xl font-bold text-slate-800">{t('visits.editTitle')}</h2>
      <p className="mt-1 text-sm text-slate-500">{place.name}</p>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{t('visits.yourRatingLabel')}</p>
            {rating ? (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
              >
                {t('visits.clear')}
              </button>
            ) : null}
          </div>
          <StarRating value={rating} onChange={(r) => setRating(r || null)} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{t('visits.yourPriceLabel')}</p>
            {price ? (
              <button
                type="button"
                onClick={() => setPrice(null)}
                className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
              >
                {t('visits.clear')}
              </button>
            ) : null}
          </div>
          <PriceLevel value={price} onChange={(p) => setPrice(p || null)} />
        </div>

        <div>
          <label
            htmlFor="visit-visited-on"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {t('visits.visitedOnLabel')}
          </label>
          <input
            id="visit-visited-on"
            type="date"
            value={visitedOn}
            onChange={(e) => setVisitedOn(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={() => onRemove(place.id)}
          disabled={isSaving}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {t('visits.remove')}
        </button>
      </div>
    </Modal>
  )
}

export default VisitEditModal
