import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import PlaceFormFields from './PlaceFormFields'
import { InvalidWebsiteUrlError, usePlaceForm } from '../hooks/usePlaceForm'
import type { PlaceFormInitial, PlaceFormValues } from '../hooks/usePlaceForm'

type Props = {
  isOpen: boolean
  latitude: number
  longitude: number
  initialData?: PlaceFormInitial
  onClose: () => void
  onSave: (data: PlaceFormValues) => Promise<void>
  onReposition?: () => void
}

function PlaceFormModal({
  isOpen,
  latitude,
  longitude,
  initialData,
  onClose,
  onSave,
  onReposition,
}: Props) {
  const { t } = useTranslation(['places', 'common'])
  const formId = useId()
  const form = usePlaceForm(initialData)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEditMode = initialData !== undefined

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    let values
    try {
      values = form.getValues()
    } catch (error) {
      if (error instanceof InvalidWebsiteUrlError) {
        setErrorMessage(t('form.invalidWebsite'))
        return
      }
      throw error
    }
    setIsSaving(true)
    try {
      await onSave(values)
      onClose()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('form.unknownError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {isEditMode && onReposition ? (
              <button
                type="button"
                onClick={onReposition}
                disabled={isSaving}
                className="rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                {t('form.reposition')}
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
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
              form={formId}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400"
            >
              {isSaving ? t('common:action.processing') : t('common:action.save')}
            </button>
          </div>
        </div>
      }
    >
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {isEditMode ? t('form.editTitle') : t('form.createTitle')}
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        {t('form.position', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) })}
      </p>
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <PlaceFormFields form={form} onError={setErrorMessage} />

        {initialData?.adopted ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
            {t('form.adoptedHint')}
          </p>
        ) : (
          <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => form.setIsPublic(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">
              <span className="block font-medium text-slate-700">{t('form.public')}</span>
              <span className="block text-slate-500">{t('form.publicHint')}</span>
            </span>
          </label>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
      </form>{' '}
    </Modal>
  )
}

export default PlaceFormModal
