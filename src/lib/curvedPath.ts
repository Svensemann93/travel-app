const CURVATURE = 0.18
const SEGMENTS = 24

export type LatLng = [number, number]

function controlPoint(from: LatLng, to: LatLng): LatLng {
  const midLat = (from[0] + to[0]) / 2
  const midLng = (from[1] + to[1]) / 2
  const deltaLat = to[0] - from[0]
  const deltaLng = to[1] - from[1]
  return [midLat - CURVATURE * deltaLng, midLng + CURVATURE * deltaLat]
}

export function arcBetween(from: LatLng, to: LatLng): LatLng[] {
  const control = controlPoint(from, to)
  const points: LatLng[] = []

  for (let step = 0; step <= SEGMENTS; step += 1) {
    const t = step / SEGMENTS
    const inverse = 1 - t
    const lat = inverse * inverse * from[0] + 2 * inverse * t * control[0] + t * t * to[0]
    const lng = inverse * inverse * from[1] + 2 * inverse * t * control[1] + t * t * to[1]
    points.push([lat, lng])
  }

  return points
}

export function curvePath(points: LatLng[]): LatLng[] {
  if (points.length < 2) return points

  const curved: LatLng[] = [points[0]]

  for (let index = 0; index < points.length - 1; index += 1) {
    const segment = arcBetween(points[index], points[index + 1])
    curved.push(...segment.slice(1))
  }

  return curved
}
