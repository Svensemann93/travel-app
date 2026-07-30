import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useFormatDate } from '../hooks/useFormatDate'
import { supabase } from '../lib/supabase'
import { resetWelcome } from '../lib/welcomeBanner'
import LanguageSwitcher from './LanguageSwitcher'
import EntryPointSetting from './EntryPointSetting'
import ConfirmDialog from './ConfirmDialog'
import ErrorState from './ErrorState'

function ProfileAbout() {
  const { t } = useTranslation(['profile', 'common'])
  const { user, profile } = useAuth()
  const { formatDateLong } = useFormatDate()
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
    resetWelcome()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
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

      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-slate-800">{t('delete.heading')}</h3>
        <p className="mb-4 text-sm text-slate-600">{t('delete.description')}</p>

        {errorMessage && (
          <div className="mb-4">
            <ErrorState message={errorMessage} />
          </div>
        )}

        <button
          onClick={() => setIsConfirmOpen(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          {t('delete.button')}
        </button>
      </div>

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

export default ProfileAbout
