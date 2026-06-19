import { useLayoutEffect, useRef, useState } from 'react'
import { DomEvent } from 'leaflet'
import type { CSSProperties } from 'react'

const BUTTON_RESERVE = 22
const SCROLLBAR =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'

type Props = {
  text: string
  expanded: boolean
  maxHeight: number
  onToggle: () => void
  onReflow: () => void
}

function PopupDescription({ text, expanded, maxHeight, onToggle, onReflow }: Props) {
  const pRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [clampLines, setClampLines] = useState<number | null>(null)
  const [showToggle, setShowToggle] = useState(false)

  useLayoutEffect(() => {
    if (scrollRef.current) DomEvent.disableScrollPropagation(scrollRef.current)
  }, [expanded])

  useLayoutEffect(() => {
    if (expanded) return
    const p = pRef.current
    const content = p?.closest('[data-popup-content]') as HTMLElement | null
    if (!p || !content) return

    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(p).lineHeight) || 19
      const nonText = content.scrollHeight - p.clientHeight
      const reserve = showToggle ? 0 : BUTTON_RESERVE
      const maxLines = Math.max(1, Math.floor((maxHeight - nonText - reserve) / lineHeight))
      const fullLines = Math.round(p.scrollHeight / lineHeight)
      setShowToggle(fullLines > maxLines)
      setClampLines(fullLines > maxLines ? maxLines : null)
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [text, expanded, showToggle, maxHeight])

  useLayoutEffect(() => {
    onReflow()
  }, [clampLines, expanded, onReflow])

  const clampStyle: CSSProperties | undefined =
    clampLines != null
      ? {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: clampLines,
          overflow: 'hidden',
        }
      : undefined

  return (
    <div className={expanded ? 'flex min-h-0 flex-1 flex-col' : 'shrink-0'}>
      {expanded ? (
        <div
          ref={scrollRef}
          className={`min-h-0 flex-1 overflow-y-auto pr-1 text-sm leading-snug text-slate-600 ${SCROLLBAR}`}
        >
          <p>{text}</p>
        </div>
      ) : (
        <p ref={pRef} className="text-sm leading-snug text-slate-600" style={clampStyle}>
          {text}
        </p>
      )}

      {showToggle || expanded ? (
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 shrink-0 text-left text-sm font-medium text-blue-600 hover:underline"
        >
          {expanded ? 'Weniger' : 'Mehr lesen'}
        </button>
      ) : null}
    </div>
  )
}

export default PopupDescription
