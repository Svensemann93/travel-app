export type PublicBounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const CELLS_PER_DEGREE = 20

function floorTo(n: number): number {
  return Math.floor(n * CELLS_PER_DEGREE) / CELLS_PER_DEGREE
}

function ceilTo(n: number): number {
  return Math.ceil(n * CELLS_PER_DEGREE) / CELLS_PER_DEGREE
}

export function normalizeBounds(bounds: PublicBounds): PublicBounds {
  return {
    minLat: floorTo(bounds.minLat),
    maxLat: ceilTo(bounds.maxLat),
    minLng: floorTo(bounds.minLng),
    maxLng: ceilTo(bounds.maxLng),
  }
}
