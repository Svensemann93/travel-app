import { useTranslation } from 'react-i18next'

type Props = {
  count?: number
}

function ListSkeleton({ count = 3 }: Props) {
  const { t } = useTranslation()
  return (
    <div className="space-y-3" role="status" aria-label={t('state.loading')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
      ))}
      <span className="sr-only">{t('state.loading')}</span>
    </div>
  )
}

export default ListSkeleton
