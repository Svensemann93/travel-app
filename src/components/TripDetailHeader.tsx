type Props = {
  name: string
  description: string | null
  dateRange: string | null
  onEdit: () => void
  onDelete: () => void
}

function TripDetailHeader({ name, description, dateRange, onEdit, onDelete }: Props) {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <div className="flex flex-shrink-0 gap-3">
          <button type="button" onClick={onEdit} className="text-sm text-blue-600 hover:underline">
            Bearbeiten
          </button>
          <button type="button" onClick={onDelete} className="text-sm text-red-600 hover:underline">
            Löschen
          </button>
        </div>
      </div>
      {dateRange && <p className="mb-2 text-sm text-slate-500">{dateRange}</p>}
      {description && <p className="mt-2 whitespace-pre-line text-slate-600">{description}</p>}
    </div>
  )
}

export default TripDetailHeader
