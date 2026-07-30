import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { clampFocus } from '../lib/imageFocus'

type Props = {
  src: string
  focusX: number
  focusY: number
  shape: 'avatar' | 'cover'
  onCancel: () => void
  onSave: (focusX: number, focusY: number) => void
}

function ProfileImageFocusEditor({ src, focusX, focusY, shape, onCancel, onSave }: Props) {
  const { t } = useTranslation(['profile', 'common'])
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
    setFocus({
      x: clampFocus(((e.clientX - rect.left) / rect.width) * 100),
      y: clampFocus(((e.clientY - rect.top) / rect.height) * 100),
    })
  }

  const position = `${focus.x}% ${focus.y}%`
  const previewClass =
    shape === 'avatar'
      ? 'mx-auto h-32 w-32 overflow-hidden rounded-full bg-slate-100'
      : 'h-24 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-28'

  return createPortal(
    <div className="fixed inset-0 z-[1600] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="shrink-0 border-b border-slate-100 p-4">
          <h2 className="text-base font-semibold text-slate-800">{t('focus.title')}</h2>
          <p className="mt-1 text-xs text-slate-500">{t('focus.hint')}</p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            onClick={handlePick}
            className="relative mx-auto w-fit cursor-crosshair select-none overflow-hidden rounded-lg bg-slate-100"
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="block max-h-[38vh] w-auto max-w-full"
            />
            <span
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#39BBDE]/80 shadow"
              style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">{t('focus.preview')}</p>
            <div className={previewClass}>
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: position }}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-slate-100 p-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {t('common:action.cancel')}
          </button>
          <button
            onClick={() => onSave(focus.x, focus.y)}
            className="flex-1 rounded-lg bg-[#39BBDE] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t('focus.apply')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ProfileImageFocusEditor
