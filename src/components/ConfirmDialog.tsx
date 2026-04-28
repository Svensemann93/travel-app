type Props = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isProcessing?: boolean
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  onConfirm,
  onCancel,
  isProcessing = false,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-slate-400"
          >
            {isProcessing ? 'Wird ausgeführt...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
