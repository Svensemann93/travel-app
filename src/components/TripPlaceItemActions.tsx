type Props = {
  onEdit?: () => void
  onRemove?: () => void
  isRemoving?: boolean
  className?: string
}

function TripPlaceItemActions({ onEdit, onRemove, isRemoving, className = '' }: Props) {
  if (!onEdit && !onRemove) return null
  return (
    <div className={className}>
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-sm text-blue-600 hover:underline">
          Bearbeiten
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={isRemoving}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {isRemoving ? '…' : 'Entfernen'}
        </button>
      )}
    </div>
  )
}

export default TripPlaceItemActions
