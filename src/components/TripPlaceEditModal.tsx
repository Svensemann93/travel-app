import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { formatDateRange } from '../lib/dateFormat'
import type { TripPlaceUpdateInput } from '../types/trip'

type Props = {
  isOpen: boolean
  initialData: TripPlaceUpdateInput
  placeName: string
  tripStartDate: string | null
  tripEndDate: string | null
  isSaving: boolean
  onSave: (data: TripPlaceUpdateInput) => void
  onClose: () => void
}

function TripPlaceEditModal({
  isOpen,
  initialData,
  placeName,
  tripStartDate,
  tripEndDate,
  isSaving,
  onSave,
  onClose,
}: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const [plannedDate, setPlannedDate] = useState(initialData.planned_date ?? '')
  const [notes, setNotes] = useState(initialData.notes ?? '')

  const tripRange = formatDateRange(tripStartDate, tripEndDate)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave({
      planned_date: plannedDate || null,
      notes: notes.trim() || null,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{placeName}</h3>
      <p className="text-sm text-slate-500 mb-4">{t('placeForm.subtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="planned-date" className="block text-sm font-medium text-slate-700 mb-1">
            {t('placeForm.plannedDate')}
          </label>
          <input
            id="planned-date"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            min={tripStartDate ?? undefined}
            max={tripEndDate ?? undefined}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {tripRange && (
            <p className="text-xs text-slate-500 mt-1">
              {t('placeForm.tripRange', { range: tripRange })}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            {t('placeForm.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={t('placeForm.notesPlaceholder')}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1 text-right">
            {t('placeForm.counter', { count: notes.length, max: 500 })}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md disabled:opacity-50"
          >
            {t('common:action.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? t('common:action.processing') : t('common:action.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TripPlaceEditModal
