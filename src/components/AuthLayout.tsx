import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  children: ReactNode
  footerText: string
  footerLinkTo: string
  footerLinkLabel: string
}

function AuthLayout({ title, children, footerText, footerLinkTo, footerLinkLabel }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">{title}</h1>
        {children}
        <p className="text-sm text-slate-600 mt-4 text-center">
          {footerText}{' '}
          <Link to={footerLinkTo} className="text-blue-600 hover:underline">
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
