import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

type MenuItem = { label: string; onClick: () => void; destructive?: boolean }

type Props = { label: string; items: MenuItem[]; icon?: ReactNode; triggerClassName?: string }

const dots = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
)

const defaultTrigger =
  'flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white'

function HeaderMenu({ label, items, icon, triggerClassName }: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuRef = useFocusTrap<HTMLDivElement>(open)

  useEffect(() => {
    if (!open) return
    function handlePointer(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={triggerClassName ?? defaultTrigger}
      >
        {icon ?? dots}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="absolute right-0 top-11 z-10 min-w-40 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 ${
                item.destructive ? 'text-red-600' : 'text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeaderMenu
