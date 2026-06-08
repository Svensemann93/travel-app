import { useId, useState } from 'react'
import Modal from './Modal'
import type { JournalInput } from '../types/journal'

type Props = {
  isOpen: boolean
  initialData?: { title: string; description: string }
  isSaving: boolean
  onClose: () => void
  onSave: (data: JournalInput) => void
}

function JournalFormModal({ isOpen, initialData, isSaving, onClose, onSave }: Props) {
  const formId = useId()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const isEdit = initialData !== undefined

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ title: title.trim(), description: description.trim() || null, trip_id: null })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSaving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      }
    >
      <h2 className="mb-4 text-xl font-bold text-slate-800">
        {isEdit ? 'Tagebuch bearbeiten' : 'Neues Tagebuch'}
      </h2>
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="journal-title" className="mb-1 block text-sm font-medium text-slate-700">
            Titel
          </label>
          <input
            id="journal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="journal-desc" className="mb-1 block text-sm font-medium text-slate-700">
            Beschreibung
          </label>
          <textarea
            id="journal-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  )
}

export default JournalFormModal
