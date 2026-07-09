import { useState } from 'react'
import { useSignedUrl } from '../hooks/useSignedUrl'

type Props = {
  path: string
  alt: string
  onClick: () => void
}

function PopupPhoto({ path, alt, onClick }: Props) {
  const src = useSignedUrl(path)
  const [isPortrait, setIsPortrait] = useState(false)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="relative h-40 w-56 shrink-0 cursor-zoom-in overflow-hidden rounded bg-slate-100"
    >
      {src ? (
        <>
          {isPortrait ? (
            <img
              src={src}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-lg"
            />
          ) : null}
          <img
            src={src}
            alt={alt}
            onLoad={(e) =>
              setIsPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)
            }
            className={`relative h-full w-full ${isPortrait ? 'object-contain' : 'object-cover'}`}
          />
        </>
      ) : (
        <div className="h-full w-full animate-pulse bg-slate-100" />
      )}
    </button>
  )
}

export default PopupPhoto
