import { useQuery } from '@tanstack/react-query'
import { getSignedUrl } from '../lib/photoStorage'

type Props = {
  path: string
  alt: string
  className?: string
}

function SignedImage({ path, alt, className }: Props) {
  const { data: src } = useQuery({
    queryKey: ['signed-url', path],
    queryFn: () => getSignedUrl(path),
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  if (!src) return <div className={`bg-slate-100 animate-pulse ${className ?? ''}`} />
  return <img src={src} alt={alt} className={className} />
}

export default SignedImage
