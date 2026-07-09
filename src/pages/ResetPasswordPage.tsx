import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { supabase } from '../lib/supabase'
import { authErrorKey } from '../lib/authErrors'

type Status = 'checking' | 'ready' | 'invalid'

function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const [status, setStatus] = useState<Status>(() =>
    window.location.hash.includes('error') ? 'invalid' : 'checking',
  )
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.hash.includes('error')) return

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })

    supabase.auth.getSession().then(({ data: sessionData }) => {
      setStatus((prev) => (prev === 'ready' ? prev : sessionData.session ? 'ready' : 'invalid'))
    })

    return () => data.subscription.unsubscribe()
  }, [])

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setIsLoading(false)
      setErrorMessage(t(authErrorKey(error.message)))
      return
    }

    await supabase.auth.signOut()
    navigate('/login')
  }

  if (status === 'checking') {
    return (
      <AuthLayout
        title={t('reset.title')}
        footerText={t('reset.footerText')}
        footerLinkTo="/login"
        footerLinkLabel={t('reset.footerLink')}
      >
        <p className="text-sm text-slate-500">{t('reset.checking')}</p>
      </AuthLayout>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthLayout
        title={t('reset.invalidTitle')}
        footerText={t('reset.invalidFooterText')}
        footerLinkTo="/forgot-password"
        footerLinkLabel={t('reset.invalidFooterLink')}
      >
        <p className="text-sm text-slate-700">{t('reset.invalidBody')}</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={t('reset.title')}
      footerText={t('reset.footerText')}
      footerLinkTo="/login"
      footerLinkLabel={t('reset.footerLink')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="password"
          label={t('reset.newPassword')}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={10}
          required
        />
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? t('reset.submitting') : t('reset.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ResetPasswordPage
