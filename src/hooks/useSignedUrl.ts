import { useQuery } from '@tanstack/react-query'
import { getSignedUrl } from '../lib/photoStorage'

function isFullUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

export function useSignedUrl(path: string): string | null {
  const alreadySigned = isFullUrl(path)
  const { data } = useQuery({
    queryKey: ['signed-url', path],
    queryFn: () => getSignedUrl(path),
    enabled: !!path && !alreadySigned,
    staleTime: 50 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 45 * 60 * 1000,
    refetchIntervalInBackground: false,
  })
  return alreadySigned ? path : (data ?? null)
}
