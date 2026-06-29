import { useTranslation } from 'react-i18next'

type Props = {
  message?: string
  onRetry?: () => void
}

function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation()
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3" role="alert">
      <p className="text-sm">{message ?? t('state.error')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-red-800 underline hover:no-underline"
        >
          {t('state.retry')}
        </button>
      )}
    </div>
  )
}

export default ErrorState
