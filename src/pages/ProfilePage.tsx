import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useFormatDate } from '../hooks/useFormatDate'
import AppHeader from '../components/AppHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import EntryPointSetting from '../components/EntryPointSetting'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ErrorState from '../components/ErrorState'

function ProfilePage() {
  const { t } = useTranslation(['profile', 'common'])
  const { formatDateLong } = useFormatDate()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDeleteAccount() {
    setIsDeleting(true)
    setErrorMessage('')

    const { error } = await supabase.functions.invoke('delete-account')

    setIsDeleting(false)

    if (error) {
      setErrorMessage(t('delete.error'))
      return
    }

    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('title')}</h2>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500">{t('username')}</label>
            <p className="text-slate-800 mt-1">{profile?.username ?? '–'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500">{t('email')}</label>
            <p className="text-slate-800 mt-1">{user?.email ?? '–'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500">{t('memberSince')}</label>
            <p className="text-slate-800 mt-1">
              {profile?.created_at ? formatDateLong(profile.created_at) : '–'}
            </p>
          </div>
        </div>

        <LanguageSwitcher />

        <EntryPointSetting />

        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('delete.heading')}</h3>
          <p className="text-sm text-slate-600 mb-4">{t('delete.description')}</p>

          {errorMessage && (
            <div className="mb-4">
              <ErrorState message={errorMessage} />
            </div>
          )}

          <button
            onClick={() => setIsConfirmOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            {t('delete.button')}
          </button>
        </div>
      </main>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={t('delete.confirmTitle')}
        message={t('delete.confirmMessage')}
        confirmLabel={t('delete.confirmButton')}
        cancelLabel={t('common:action.cancel')}
        isProcessing={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}

export default ProfilePage
