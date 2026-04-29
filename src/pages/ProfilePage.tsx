import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import ConfirmDialog from '../components/ConfirmDialog'

function ProfilePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    setErrorMessage('')

    const { error } = await supabase.rpc('delete_own_account')

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-slate-800">Travel App</h1>
          <nav className="flex gap-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              Karte
            </Link>
            <Link to="/places" className="text-sm text-slate-600 hover:text-slate-900">
              Meine Orte
            </Link>
            <Link to="/profile" className="text-sm font-semibold text-slate-900">
              Profil
            </Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors text-sm"
        >
          Abmelden
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Mein Profil</h2>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500">Benutzername</label>
            <p className="text-slate-800 mt-1">{profile?.username ?? '–'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500">E-Mail</label>
            <p className="text-slate-800 mt-1">{user?.email ?? '–'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500">Mitglied seit</label>
            <p className="text-slate-800 mt-1">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-CH') : '–'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Account löschen</h3>
          <p className="text-sm text-slate-600 mb-4">
            Wenn du deinen Account löschst, werden alle deine Daten unwiderruflich entfernt.
          </p>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
              {errorMessage}
            </div>
          )}

          <button
            onClick={() => setIsConfirmOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Account löschen
          </button>
        </div>
      </main>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Account wirklich löschen?"
        message="Alle deine Orte und persönlichen Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Endgültig löschen"
        isProcessing={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}

export default ProfilePage
