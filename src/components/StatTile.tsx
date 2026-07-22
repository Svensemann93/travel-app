import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  label: string
  value: string
}

function StatTile({ icon, label, value }: Props) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#39BBDE]/10 text-[#39BBDE]">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-lg font-semibold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

export default StatTile
