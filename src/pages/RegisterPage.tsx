import { useState } from 'react'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import RegistrationSuccess from '../components/RegistrationSuccess'
import { supabase } from '../lib/supabase'

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }
    setIsRegistered(true)
  }

  if (isRegistered) {
    return <RegistrationSuccess email={email} />
  }

  return (
    <AuthLayout
      title="Registrieren"
      footerText="Bereits registriert?"
      footerLinkTo="/login"
      footerLinkLabel="Hier anmelden"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <FormField
          id="username"
          label="Benutzername"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          required
        />
        <FormField
          id="password"
          label="Passwort"
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
          {isLoading ? 'Wird registriert...' : 'Registrieren'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
