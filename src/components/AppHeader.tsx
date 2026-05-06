import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { to: '/', label: 'Karte', match: (path: string) => path === '/' },
  { to: '/places', label: 'Meine Orte', match: (path: string) => path === '/places' },
  { to: '/trips', label: 'Trips', match: (path: string) => path.startsWith('/trips') },
  { to: '/profile', label: 'Profil', match: (path: string) => path === '/profile' },
]

function AppHeader() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-slate-800">Travel App</h1>
        <nav className="flex gap-4">
          {NAV_ITEMS.map(({ to, label, match }) => {
            const isActive = match(location.pathname)
            return (
              <Link
                key={to}
                to={to}
                className={
                  isActive
                    ? 'text-sm font-semibold text-slate-900'
                    : 'text-sm text-slate-600 hover:text-slate-900'
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">{profile?.username ?? user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors text-sm"
        >
          Abmelden
        </button>
      </div>
    </header>
  )
}

export default AppHeader
