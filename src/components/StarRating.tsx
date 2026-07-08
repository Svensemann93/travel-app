import { useState } from 'react'
import { STAR_PATH } from './StarDisplay'

type Props = {
  value: number | null
  onChange: (v: number) => void
}

function StarRating({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value ?? 0

  function pick(v: number) {
    onChange(value === v ? 0 : v)
  }

  return (
    <div className="flex gap-1 text-2xl leading-none" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = display >= star ? 1 : display >= star - 0.5 ? 0.5 : 0
        return (
          <div key={star} className="relative inline-block h-[1em] w-[1em]">
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full fill-slate-300">
              <path d={STAR_PATH} />
            </svg>
            {fill > 0 ? (
              <span
                className="absolute left-0 top-0 h-full overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="absolute left-0 top-0 h-[1em] w-[1em] fill-yellow-400"
                >
                  <path d={STAR_PATH} />
                </svg>
              </span>
            ) : null}
            <button
              type="button"
              aria-label={`${star - 0.5}`}
              onClick={() => pick(star - 0.5)}
              onMouseEnter={() => setHovered(star - 0.5)}
              className="absolute inset-y-0 left-0 z-10 w-1/2"
            />
            <button
              type="button"
              aria-label={`${star}`}
              onClick={() => pick(star)}
              onMouseEnter={() => setHovered(star)}
              className="absolute inset-y-0 right-0 z-10 w-1/2"
            />
          </div>
        )
      })}
    </div>
  )
}

export default StarRating
