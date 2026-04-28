import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

function MapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Karte</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors text-sm"
          >
            Abmelden
          </button>
        </div>
      </div>
      <p className="text-slate-600">Hier wird die Karte angezeigt.</p>
    </div>
  )
}

export default MapPage
