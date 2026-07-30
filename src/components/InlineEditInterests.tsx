import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeInterests } from '../lib/profileInterests'

type Props = {
  values: string[]
  onSave: (values: string[]) => Promise<void>
  ariaLabel: string
  placeholder?: string
}

const chip = 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'

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

function InlineEditInterests({ values, onSave, ariaLabel, placeholder }: Props) {
  const { t } = useTranslation('common')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string[]>(values)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  function start() {
    setDraft(values)
    setInput('')
    setError(false)
    setEditing(true)
  }

  function add() {
    const next = normalizeInterests([...draft, input])
    setDraft(next)
    setInput('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    }
  }

  async function save() {
    setSaving(true)
    setError(false)
    try {
      await onSave(normalizeInterests(draft))
      setEditing(false)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {draft.map((item) => (
            <span key={item} className={`flex items-center gap-1 ${chip}`}>
              {item}
              <button
                type="button"
                onClick={() => setDraft(draft.filter((v) => v !== item))}
                aria-label={t('action.delete')}
                className="text-slate-400 transition-colors hover:text-slate-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none"
        />
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

  return (
    <div className="flex items-start gap-2">
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <span key={item} className={chip}>
              {item}
            </span>
          ))}
        </div>
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

export default InlineEditInterests
