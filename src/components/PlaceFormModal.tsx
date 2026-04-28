import { useState } from 'react'

type PlaceData = {
  name: string
  description: string
}

type Props = {
  isOpen: boolean
  latitude: number
  longitude: number
  initialData?: PlaceData
  onClose: () => void
  onSave: (data: PlaceData) => Promise<void>
}

function PlaceFormModal({ isOpen, latitude, longitude, initialData, onClose, onSave }: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEditMode = initialData !== undefined

  if (!isOpen) return null

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)

    try {
      await onSave({ name, description })
      onClose()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {isEditMode ? 'Ort bearbeiten' : 'Neuen Ort hinzufügen'}
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          Position: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="place-name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="place-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="place-description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="place-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2 justify-end">
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
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400"
            >
              {isSaving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlaceFormModal
