type Props = {
  value: number | null
  onChange: (v: number) => void
}

function PriceLevel({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(value === level ? 0 : level)}
          className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
            (value ?? 0) >= level
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-slate-300 text-slate-400 hover:border-slate-400'
          }`}
        >
          {'$'.repeat(level)}
        </button>
      ))}
    </div>
  )
}

export default PriceLevel
