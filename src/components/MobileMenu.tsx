import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface NavItem {
  to: string
  label: string
  match: (path: string) => boolean
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
  currentPath: string
  userLabel: string
  onLogout: () => void
}

function MobileMenu({
  isOpen,
  onClose,
  navItems,
  currentPath,
  userLabel,
  onLogout,
}: MobileMenuProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!isOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[1100] bg-black/50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.label')}
        className={`fixed top-0 right-0 z-[1200] flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-xl transition-transform md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('menu.close')}
          className="self-end p-4 text-slate-600 hover:text-slate-900"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {navItems.map(({ to, label, match }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`rounded-md px-3 py-3 ${
                match(currentPath)
                  ? 'bg-slate-100 font-semibold text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-6 py-4">
          <p className="mb-3 truncate text-sm text-slate-600">{userLabel}</p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-md bg-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-300"
          >
            {t('auth.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}

export default MobileMenu
