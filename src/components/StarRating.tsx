import { useState } from 'react'

type Props = {
  value: number | null
  onChange: (v: number) => void
}

function StarRating({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl leading-none transition-colors"
        >
          <span className={(hovered ?? value ?? 0) >= star ? 'text-yellow-400' : 'text-slate-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export default StarRating
