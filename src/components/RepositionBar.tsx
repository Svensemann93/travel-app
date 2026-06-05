type Props = {
  placeName: string
  hasMoved: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

function RepositionBar({ placeName, hasMoved, isSaving, onSave, onCancel }: Props) {
  return (
    <div className="absolute bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-4 rounded-full bg-white px-5 py-3 shadow-lg">
      <span className="text-sm text-slate-700">
        Ziehe den Pin von <strong>{placeName}</strong> an die neue Position
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
        >
          Abbrechen
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasMoved || isSaving}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
        >
          {isSaving ? 'Speichert...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}

export default RepositionBar
