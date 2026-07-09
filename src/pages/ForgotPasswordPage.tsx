import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { supabase } from '../lib/supabase'
import { authErrorKey } from '../lib/authErrors'

function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(t(authErrorKey(error.message)))
      return
    }
    setIsSent(true)
  }

  if (isSent) {
    return (
      <AuthLayout
        title={t('forgot.sentTitle')}
        footerText={t('forgot.footerText')}
        footerLinkTo="/login"
        footerLinkLabel={t('forgot.footerLink')}
      >
        <div className="text-sm text-slate-700 space-y-3">
          <p>{t('forgot.sentInstruction')}</p>
          <p className="text-slate-500">{t('success.spamHint')}</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={t('forgot.title')}
      footerText={t('forgot.footerText')}
      footerLinkTo="/login"
      footerLinkLabel={t('forgot.footerLink')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">{t('forgot.intro')}</p>
        <FormField
          id="email"
          label={t('field.email')}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
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
          {isLoading ? t('forgot.submitting') : t('forgot.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
