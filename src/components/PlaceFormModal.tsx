import { useId, useState } from 'react'
import Modal from './Modal'
import PlaceFormFields from './PlaceFormFields'
import { usePlaceForm } from '../hooks/usePlaceForm'
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
  const formId = useId()
  const form = usePlaceForm(initialData)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEditMode = initialData !== undefined

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)
    try {
      await onSave(form.getValues())
      onClose()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler')
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
                Standort verschieben
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
              Abbrechen
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400"
            >
              {isSaving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </div>
      }
    >
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {isEditMode ? 'Ort bearbeiten' : 'Neuen Ort hinzufügen'}
      </h2>

      <p className="text-sm text-slate-500 mb-4">
        Position: {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </p>

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <PlaceFormFields form={form} onError={setErrorMessage} />

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
      </form>
    </Modal>
  )
}

export default PlaceFormModal
