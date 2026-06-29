import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  fullscreenOnMobile?: boolean
}

function Modal({
  isOpen,
  onClose,
  children,
  footer,
  maxWidth = 'md',
  fullscreenOnMobile = true,
}: Props) {
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen)

  useEffect(() => {
    if (!isOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
  }[maxWidth]

  const wrapperClass = fullscreenOnMobile
    ? 'fixed inset-0 z-[1100] flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4'
    : 'fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4'

  const containerClass = fullscreenOnMobile
    ? `flex h-full w-full flex-col overflow-hidden bg-white shadow-xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg ${maxWidthClass}`
    : `flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl ${maxWidthClass}`

  return (
    <div className={wrapperClass} onClick={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={containerClass}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}

export default Modal
