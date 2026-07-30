import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import InlineEditInterests from './InlineEditInterests'

function ProfileAbout() {
  const { t } = useTranslation('profile')
  const { profile } = useAuth()
  const update = useUpdateProfile()

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-sm font-medium text-slate-500">{t('about.interests')}</h3>
      <InlineEditInterests
        values={profile?.interests ?? []}
        onSave={(v) => update.mutateAsync({ interests: v })}
        ariaLabel={t('about.editInterests')}
        placeholder={t('about.interestsPlaceholder')}
      />
    </div>
  )
}

export default ProfileAbout
