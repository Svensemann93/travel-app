import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import type { TripInput } from '../types/trip'

type Props = {
  isOpen: boolean
  initialData?: TripInput
  onClose: () => void
  onSave: (data: TripInput) => Promise<void>
}

function TripFormModal({ isOpen, initialData, onClose, onSave }: Props) {
  const { t } = useTranslation(['trips', 'common'])
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [startDate, setStartDate] = useState(initialData?.start_date ?? '')
  const [endDate, setEndDate] = useState(initialData?.end_date ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEditMode = initialData !== undefined

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (startDate && endDate && endDate < startDate) {
      setErrorMessage(t('form.endBeforeStart'))
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('form.unknownError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {isEditMode ? t('form.editTitle') : t('form.createTitle')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="trip-name" className="block text-sm font-medium text-slate-700 mb-1">
            {t('form.name')}
          </label>
          <input
            id="trip-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={120}
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="trip-description"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {t('form.description')}
          </label>
          <textarea
            id="trip-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="trip-start" className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.from')}
            </label>
            <input
              id="trip-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="trip-end" className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.to')}
            </label>
            <input
              id="trip-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {t('common:action.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400"
          >
            {isSaving ? t('common:action.processing') : t('common:action.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TripFormModal
