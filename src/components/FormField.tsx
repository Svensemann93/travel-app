type Props = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'date' | 'url'
  value: string
  onChange: (v: string) => void
  required?: boolean
  maxLength?: number
  autoFocus?: boolean
  placeholder?: string
  min?: string
  max?: string
}

function FormField({ id, label, type = 'text', value, onChange, ...rest }: Props) {
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
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...rest}
      />
    </div>
  )
}

export default FormField
