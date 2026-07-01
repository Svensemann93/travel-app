import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Props = {
  title: string
  children: ReactNode
  footerText: string
  footerLinkTo: string
  footerLinkLabel: string
}

function AuthLayout({ title, children, footerText, footerLinkTo, footerLinkLabel }: Props) {
  const { t } = useTranslation('auth')

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Hero / Brand-Panel */}
      <div className="relative h-48 w-full overflow-hidden md:h-auto md:w-1/2">
        <img src="/auth-bg.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-9 w-auto drop-shadow" />
            <span className="text-xl font-bold tracking-tight text-white drop-shadow">
              Travel App
            </span>
          </div>
          <p className="mt-2 hidden max-w-sm text-sm text-white/90 drop-shadow md:block">
            {t('hero.tagline')}
          </p>
        </div>
      </div>

      {/* Formular-Panel */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-2xl font-bold text-slate-800">{title}</h1>
          {children}
          <p className="mt-6 text-center text-sm text-slate-600">
            {footerText}{' '}
            <Link to={footerLinkTo} className="font-medium text-blue-600 hover:underline">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
