import type { HTMLAttributes } from 'react'

type Props = {
  handleProps: HTMLAttributes<HTMLButtonElement>
}

function DragHandle({ handleProps }: Props) {
  return (
    <button
      type="button"
      {...handleProps}
      onClick={(e) => e.stopPropagation()}
      aria-label="Reihenfolge ändern"
      className="mt-1 flex-shrink-0 cursor-grab touch-none p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="3" r="1.5" />
        <circle cx="10" cy="3" r="1.5" />
        <circle cx="6" cy="8" r="1.5" />
        <circle cx="10" cy="8" r="1.5" />
        <circle cx="6" cy="13" r="1.5" />
        <circle cx="10" cy="13" r="1.5" />
      </svg>
    </button>
  )
}

export default DragHandle
