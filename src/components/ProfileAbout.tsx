import { useTranslation } from 'react-i18next'
import EmptyState from './EmptyState'

function ProfileAbout() {
  const { t } = useTranslation('profile')

  return <EmptyState title={t('about.emptyTitle')} message={t('about.emptyMessage')} />
}

export default ProfileAbout
