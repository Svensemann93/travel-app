import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { supabase } from '../lib/supabase'
import { authErrorKey } from '../lib/authErrors'

function LoginPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setIsLoading(false)

    if (error) {
      setErrorMessage(t(authErrorKey(error.message)))
      return
    }
    navigate('/')
  }

  return (
    <AuthLayout
      title={t('login.title')}
      footerText={t('login.footerText')}
      footerLinkTo="/register"
      footerLinkLabel={t('login.footerLink')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label={t('field.email')}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <FormField
          id="password"
          label={t('field.password')}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
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
          {isLoading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
