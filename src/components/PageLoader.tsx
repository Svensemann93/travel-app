import { useTranslation } from 'react-i18next'

function PageLoader() {
  const { t } = useTranslation('common')
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label={t('state.loadingPage')}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
      <span className="sr-only">{t('state.loading')}</span>
    </div>
  )
}

export default PageLoader
