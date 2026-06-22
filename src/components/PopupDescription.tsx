import { useLayoutEffect, useRef } from 'react'
import { DomEvent } from 'leaflet'

const SCROLLBAR =
  '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'

function PopupDescription({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (ref.current) DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div
      ref={ref}
      className={`min-h-0 flex-1 overflow-y-auto pr-1 text-sm leading-snug text-slate-600 ${SCROLLBAR}`}
    >
      <p>{text}</p>
    </div>
  )
}

export default PopupDescription
