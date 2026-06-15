import type { CSSProperties } from 'react'
import { useSignedUrl } from '../hooks/useSignedUrl'

type Props = {
  path: string
  alt: string
  className?: string
  style?: CSSProperties
}

function SignedImage({ path, alt, className, style }: Props) {
  const src = useSignedUrl(path)
  if (!src) return <div className={`bg-slate-100 animate-pulse ${className ?? ''}`} style={style} />
  return <img src={src} alt={alt} className={className} style={style} />
}

export default SignedImage
