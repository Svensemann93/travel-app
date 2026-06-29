import { useTranslation } from 'react-i18next'
import Modal from './Modal'

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
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isProcessing = false,
}: Props) {
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onClose={onCancel} fullscreenOnMobile={false}>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-600 mb-6">{message}</p>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          {cancelLabel ?? t('action.cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-slate-400"
        >
          {isProcessing ? t('action.processing') : (confirmLabel ?? t('action.confirm'))}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
