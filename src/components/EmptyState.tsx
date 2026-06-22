import type { ReactNode } from 'react'

type Props = {
  title: string
  message?: string
  action?: ReactNode
}

function EmptyState({ title, message, action }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {message && <p className="text-sm text-slate-600 mt-2">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState
