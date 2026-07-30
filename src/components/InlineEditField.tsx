import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string
  onSave: (value: string) => Promise<void>
  ariaLabel: string
  displayValue?: string
  placeholder?: string
  multiline?: boolean
  maxLength?: number
  valueClassName?: string
}

const pencil = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

function InlineEditField({
  value,
  onSave,
  ariaLabel,
  displayValue,
  placeholder,
  multiline,
  maxLength,
  valueClassName,
}: Props) {
  const { t } = useTranslation('common')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  function start() {
    setDraft(value)
    setError(false)
    setEditing(true)
  }

  async function save() {
    setSaving(true)
    setError(false)
    try {
      await onSave(draft.trim())
      setEditing(false)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    const field =
      'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none'
    return (
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={maxLength}
            rows={3}
            className={field}
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={maxLength}
            className={field}
          />
        )}
        {error && <p className="text-sm text-red-600">{t('state.error')}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
          >
            {t('action.save')}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 disabled:opacity-50"
          >
            {t('action.cancel')}
          </button>
        </div>
      </div>
    )
  }

  const shown = displayValue ?? value

  return (
    <div className="flex items-start gap-2">
      {shown ? (
        <span className={valueClassName}>{shown}</span>
      ) : (
        <span className="text-slate-400">{placeholder}</span>
      )}
      <button
        type="button"
        onClick={start}
        aria-label={ariaLabel}
        className="mt-0.5 shrink-0 text-slate-400 transition-colors hover:text-slate-600"
      >
        {pencil}
      </button>
    </div>
  )
}

export default InlineEditField
