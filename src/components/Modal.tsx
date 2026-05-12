import { useEffect } from 'react'
import type { ReactNode } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  fullscreenOnMobile?: boolean
}

function Modal({ isOpen, onClose, children, maxWidth = 'md', fullscreenOnMobile = true }: Props) {
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
    ? `flex h-full w-full flex-col overflow-y-auto bg-white p-6 shadow-xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg ${maxWidthClass}`
    : `max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white p-6 shadow-xl ${maxWidthClass}`

  return (
    <div className={wrapperClass} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={containerClass}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
