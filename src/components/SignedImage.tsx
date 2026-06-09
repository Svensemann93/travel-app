import { useQuery } from '@tanstack/react-query'
import { getSignedUrl } from '../lib/photoStorage'

type Props = {
  path: string
  alt: string
  className?: string
}

function isFullUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

function SignedImage({ path, alt, className }: Props) {
  const alreadySigned = isFullUrl(path)

  const { data: signed } = useQuery({
    queryKey: ['signed-url', path],
    queryFn: () => getSignedUrl(path),
    enabled: !!path && !alreadySigned,
    staleTime: 50 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  const src = alreadySigned ? path : signed
  if (!src) return <div className={`bg-slate-100 animate-pulse ${className ?? ''}`} />
  return <img src={src} alt={alt} className={className} />
}

export default SignedImage
