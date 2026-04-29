import { useEffect, useState } from 'react'
import { getSignedUrl } from '../lib/photoStorage'

type Props = {
  path: string
  alt: string
  className?: string
}

function SignedImage({ path, alt, className }: Props) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSignedUrl(path).then((url) => {
      if (!cancelled) setSrc(url)
    })
    return () => {
      cancelled = true
    }
  }, [path])

  if (!src) return <div className={`bg-slate-100 animate-pulse ${className ?? ''}`} />
  return <img src={src} alt={alt} className={className} />
}

export default SignedImage
