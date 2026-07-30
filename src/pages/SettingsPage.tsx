import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useFormatDate } from '../hooks/useFormatDate'
import AppHeader from '../components/AppHeader'
import LanguageSwitcher from '../components/LanguageSwitcher'
import EntryPointSetting from '../components/EntryPointSetting'
import DeleteAccountSection from '../components/DeleteAccountSection'

function SettingsPage() {
  const { t } = useTranslation('profile')
  const { user, profile } = useAuth()
  const { formatDateLong } = useFormatDate()

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-2xl space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-sm font-medium text-sky-600">{t('settings.eyebrow')}</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {t('settings.title')}
          </h2>
          <p className="mt-2 text-slate-500">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-500">{t('username')}</label>
            <p className="mt-1 text-slate-800">{profile?.username ?? '–'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">{t('email')}</label>
            <p className="mt-1 text-slate-800">{user?.email ?? '–'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">{t('memberSince')}</label>
            <p className="mt-1 text-slate-800">
              {profile?.created_at ? formatDateLong(profile.created_at) : '–'}
            </p>
          </div>
        </div>

        <LanguageSwitcher />
        <EntryPointSetting />
        <DeleteAccountSection />
      </main>
    </div>
  )
}

export default SettingsPage
