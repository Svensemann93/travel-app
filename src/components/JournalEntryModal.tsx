import { useId, useState } from 'react'
import Modal from './Modal'
import type { JournalEntryInput } from '../types/journal'

type Props = {
  isOpen: boolean
  initialData?: { entry_date: string; title: string; body: string }
  isSaving: boolean
  onClose: () => void
  onSave: (data: JournalEntryInput) => void
}

function JournalEntryModal({ isOpen, initialData, isSaving, onClose, onSave }: Props) {
  const formId = useId()
  const [entryDate, setEntryDate] = useState(initialData?.entry_date ?? '')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [body, setBody] = useState(initialData?.body ?? '')
  const isEdit = initialData !== undefined

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({
      entry_date: entryDate || null,
      title: title.trim() || null,
      body: body.trim() || null,
      place_id: null,
    })
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
        {isEdit ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
      </h2>
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="entry-date" className="mb-1 block text-sm font-medium text-slate-700">
            Datum
          </label>
          <input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="entry-title" className="mb-1 block text-sm font-medium text-slate-700">
            Titel
          </label>
          <input
            id="entry-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="entry-body" className="mb-1 block text-sm font-medium text-slate-700">
            Text
          </label>
          <textarea
            id="entry-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  )
}

export default JournalEntryModal
