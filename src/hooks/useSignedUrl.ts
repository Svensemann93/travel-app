import { useQuery } from '@tanstack/react-query'
import { getSignedUrl } from '../lib/photoStorage'
import { isPublicAsset } from '../lib/assetPath'

export function useSignedUrl(path: string): string | null {
  const alreadyPublic = isPublicAsset(path)
  const { data } = useQuery({
    queryKey: ['signed-url', path],
    queryFn: () => getSignedUrl(path),
    enabled: !!path && !alreadyPublic,
    staleTime: 50 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 45 * 60 * 1000,
    refetchIntervalInBackground: false,
  })
  return alreadyPublic ? path : (data ?? null)
}
