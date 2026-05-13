import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { supabase } from '../lib/supabase'

function LoginPage() {
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
      setErrorMessage(error.message)
      return
    }
    navigate('/')
  }

  return (
    <AuthLayout
      title="Anmelden"
      footerText="Noch kein Konto?"
      footerLinkTo="/register"
      footerLinkLabel="Jetzt registrieren"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="E-Mail"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <FormField
          id="password"
          label="Passwort"
          type="password"
          value={password}
          onChange={setPassword}
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
          {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
