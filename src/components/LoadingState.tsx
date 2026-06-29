import { useTranslation } from 'react-i18next'

type Props = {
  label?: string
}

function LoadingState({ label }: Props) {
  const { t } = useTranslation()
  const text = label ?? t('state.loading')
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label={text}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
      <span className="sr-only">{text}</span>
    </div>
  )
}

export default LoadingState
