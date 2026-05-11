import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import MobileMenu from './MobileMenu'

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
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const userLabel = profile?.username ?? user?.email ?? ''

  async function handleLogout() {
    setIsMobileOpen(false)
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <>
      <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm md:px-8">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-slate-800">Travel App</h1>
          <nav className="hidden gap-4 md:flex">
            {NAV_ITEMS.map(({ to, label, match }) => (
              <Link
                key={to}
                to={to}
                className={
                  match(location.pathname)
                    ? 'text-sm font-semibold text-slate-900'
                    : 'text-sm text-slate-600 hover:text-slate-900'
                }
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm text-slate-600">{userLabel}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-300"
          >
            Abmelden
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Menü öffnen"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
          className="p-2 text-slate-700 hover:text-slate-900 md:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </header>
      <MobileMenu
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={NAV_ITEMS}
        currentPath={location.pathname}
        userLabel={userLabel}
        onLogout={handleLogout}
      />
    </>
  )
}

export default AppHeader
