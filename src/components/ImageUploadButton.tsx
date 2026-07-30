import { useRef, type ChangeEvent, type ReactNode } from 'react'

type Props = {
  onFile: (file: File) => void
  ariaLabel: string
  className?: string
  disabled?: boolean
  children: ReactNode
}

function ImageUploadButton({ onFile, ariaLabel, className, disabled, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onFile(file)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </>
  )
}

export default ImageUploadButton
