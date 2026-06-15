import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useSignedUrl } from '../hooks/useSignedUrl'

type Props = {
  path: string
  focusX: number
  focusY: number
  onCancel: () => void
  onSave: (focusX: number, focusY: number) => void
}

function clamp(v: number) {
  return Math.min(100, Math.max(0, Math.round(v)))
}

function CoverFocusEditor({ path, focusX, focusY, onCancel, onSave }: Props) {
  const src = useSignedUrl(path)
  const [focus, setFocus] = useState({ x: focusX, y: focusY })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onCancel])

  function handlePick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setFocus({ x: clamp(x), y: clamp(y) })
  }

  const position = `${focus.x}% ${focus.y}%`

  return createPortal(
    <div className="fixed inset-0 z-[1600] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="shrink-0 border-b border-slate-100 p-4">
          <h2 className="text-base font-semibold text-slate-800">Ausschnitt wählen</h2>
          <p className="mt-1 text-xs text-slate-500">
            Tippe auf den wichtigsten Punkt im Bild – er bleibt im Titelbild sichtbar.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div
            onClick={handlePick}
            className="relative mx-auto w-fit cursor-crosshair select-none overflow-hidden rounded-lg bg-slate-100"
          >
            {src && (
              <img
                src={src}
                alt=""
                draggable={false}
                className="block max-h-[45vh] w-auto max-w-full"
              />
            )}
            <span
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600/70 shadow"
              style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">Vorschau Titelbild</p>
            <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-40">
              {src && (
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: position }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-slate-100 p-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onSave(focus.x, focus.y)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Übernehmen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CoverFocusEditor
