import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap<ContainerElement extends HTMLElement>(active: boolean) {
  const containerRef = useRef<ContainerElement>(null)

  useEffect(() => {
    if (!active) return
    const element = containerRef.current
    if (!element) return
    const node = element

    const previouslyFocused = document.activeElement as HTMLElement | null

    function focusable(): HTMLElement[] {
      return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      )
    }

    const initial = focusable()
    if (initial.length > 0) {
      initial[0].focus()
    } else {
      node.focus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement
      if (event.shiftKey) {
        if (current === first || !node.contains(current)) {
          event.preventDefault()
          last.focus()
        }
      } else if (current === last || !node.contains(current)) {
        event.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', handleKeyDown)
    return () => {
      node.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [active])

  return containerRef
}
