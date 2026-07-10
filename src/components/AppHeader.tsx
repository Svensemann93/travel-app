import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import MobileMenu from './MobileMenu'
import CategoryFilter from './CategoryFilter'
import { resetWelcome } from '../lib/welcomeBanner'

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.map', match: (path: string) => path === '/' },
  { to: '/places', labelKey: 'nav.places', match: (path: string) => path === '/places' },
  { to: '/trips', labelKey: 'nav.trips', match: (path: string) => path.startsWith('/trips') },
  { to: '/journal', labelKey: 'nav.journal', match: (path: string) => path.startsWith('/journal') },
  { to: '/passport', labelKey: 'nav.pass', match: (path: string) => path === '/passport' },
  { to: '/profile', labelKey: 'nav.profile', match: (path: string) => path === '/profile' },
] as const

type Props = {
  sticky?: boolean
}

function AppHeader({ sticky = false }: Props) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const userLabel = profile?.username ?? user?.email ?? ''

  const navItems = NAV_ITEMS.map((item) => ({
    to: item.to,
    label: t(item.labelKey),
    match: item.match,
  }))

  async function handleLogout() {
    resetWelcome()
    await supabase.auth.signOut()
    setIsMobileOpen(false)
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login')
  }

  const headerClass = `flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6${
    sticky ? ' sticky top-0 z-30' : ''
  }`

  return (
    <>
      <header className={headerClass}>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-9 w-auto" />
            <span className="text-lg font-bold tracking-tight text-slate-900">Travel App</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {navItems.map(({ to, label, match }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  match(location.pathname)
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <CategoryFilter className="md:hidden" />

          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-slate-500">{userLabel}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {t('auth.logout')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label={t('menu.open')}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
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
        </div>
      </header>
      <MobileMenu
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={navItems}
        currentPath={location.pathname}
        userLabel={userLabel}
        onLogout={handleLogout}
      />
    </>
  )
}

export default AppHeader
