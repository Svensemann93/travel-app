type Props = {
  label: string
  value: number
  max: number
  color?: string
}

function ProgressBar({ label, value, max, color = '#39BBDE' }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
