import type { QueryClient } from '@tanstack/react-query'
import type { PublicPlace } from '../types/place'

export function patchPublicPlace(
  queryClient: QueryClient,
  placeId: string,
  patch: Partial<PublicPlace>,
) {
  queryClient.setQueriesData<PublicPlace[]>({ queryKey: ['public-places'] }, (current) =>
    current ? current.map((p) => (p.id === placeId ? { ...p, ...patch } : p)) : current,
  )
}
