import type { ReactNode } from 'react'

type HintTone = 'neutral' | 'success' | 'error'

type Props = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'date' | 'url'
  value: string
  onChange: (v: string) => void
  required?: boolean
  maxLength?: number
  minLength?: number
  autoFocus?: boolean
  autoComplete?: string
  placeholder?: string
  min?: string
  max?: string
  hint?: ReactNode
  hintTone?: HintTone
}

const hintColor: Record<HintTone, string> = {
  neutral: 'text-slate-500',
  success: 'text-green-600',
  error: 'text-red-600',
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  hint,
  hintTone = 'neutral',
  ...rest
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className={`mt-1 text-xs ${hintColor[hintTone]}`}>
          {hint}
        </p>
      )}
    </div>
  )
}

export default FormField
