import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import RegistrationSuccess from '../components/RegistrationSuccess'
import { supabase } from '../lib/supabase'
import { authErrorKey } from '../lib/authErrors'
import { useUsernameAvailability } from '../hooks/useUsernameAvailability'

function RegisterPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const usernameStatus = useUsernameAvailability(username)

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (usernameStatus === 'taken') return
    setErrorMessage('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(t(authErrorKey(error.message)))
      return
    }
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrorMessage(t('error.emailInUse'))
      return
    }
    setIsRegistered(true)
  }

  if (isRegistered) {
    return <RegistrationSuccess email={email} />
  }

  const usernameHint =
    usernameStatus === 'checking'
      ? t('username.checking')
      : usernameStatus === 'available'
        ? t('username.available')
        : usernameStatus === 'taken'
          ? t('username.taken')
          : undefined

  const usernameTone =
    usernameStatus === 'available' ? 'success' : usernameStatus === 'taken' ? 'error' : 'neutral'

  return (
    <AuthLayout
      title={t('register.title')}
      footerText={t('register.footerText')}
      footerLinkTo="/login"
      footerLinkLabel={t('register.footerLink')}
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
          id="username"
          label={t('field.username')}
          value={username}
          onChange={setUsername}
          autoComplete="username"
          minLength={3}
          required
          hint={usernameHint}
          hintTone={usernameTone}
        />
        <FormField
          id="password"
          label={t('field.password')}
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
          disabled={isLoading || usernameStatus === 'checking' || usernameStatus === 'taken'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
