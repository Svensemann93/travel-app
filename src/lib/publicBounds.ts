export type PublicBounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const STEP = 5

function floorTo(n: number): number {
  return (Math.floor(Math.round(n * 100) / STEP) * STEP) / 100
}

function ceilTo(n: number): number {
  return (Math.ceil(Math.round(n * 100) / STEP) * STEP) / 100
}

export function normalizeBounds(bounds: PublicBounds): PublicBounds {
  return {
    minLat: floorTo(bounds.minLat),
    maxLat: ceilTo(bounds.maxLat),
    minLng: floorTo(bounds.minLng),
    maxLng: ceilTo(bounds.maxLng),
  }
}
