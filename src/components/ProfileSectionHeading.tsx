import { useTranslation } from 'react-i18next'

type Props = { title: string; onShowAll: () => void }

function ProfileSectionHeading({ title, onShowAll }: Props) {
  const { t } = useTranslation('profile')

  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <button
        type="button"
        onClick={onShowAll}
        className="text-sm font-medium text-sky-600 hover:underline"
      >
        {t('highlightsTab.showAll')}
      </button>
    </div>
  )
}

export default ProfileSectionHeading
