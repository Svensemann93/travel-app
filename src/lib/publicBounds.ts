export type PublicBounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const PRECISION = 100

export function normalizeBounds(bounds: PublicBounds): PublicBounds {
  return {
    minLat: Math.floor(bounds.minLat * PRECISION) / PRECISION,
    maxLat: Math.ceil(bounds.maxLat * PRECISION) / PRECISION,
    minLng: Math.floor(bounds.minLng * PRECISION) / PRECISION,
    maxLng: Math.ceil(bounds.maxLng * PRECISION) / PRECISION,
  }
}
