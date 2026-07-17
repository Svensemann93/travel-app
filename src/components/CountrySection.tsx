import type { ReactNode } from 'react'

type Props = {
  name: string
  count: number
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

function CountrySection({ name, count, isOpen, onToggle, children }: Props) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="mb-2 flex w-full items-center gap-2 text-left text-sm font-semibold tracking-wide text-slate-500 uppercase hover:text-slate-700"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        {name}
        <span className="text-xs font-normal normal-case">({count})</span>
      </button>
      {isOpen && children}
    </section>
  )
}

export default CountrySection
