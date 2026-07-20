import { STANDARD_COVERS } from './tripCovers'

export function fallbackCoverPath(tripId: string): string {
  let hash = 0
  for (let i = 0; i < tripId.length; i++) {
    hash = (hash * 31 + tripId.charCodeAt(i)) >>> 0
  }
  return STANDARD_COVERS[hash % STANDARD_COVERS.length].path
}
