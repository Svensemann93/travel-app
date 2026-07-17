export type FocusPoint = {
  latitude: number
  longitude: number
}

export function parseFocusPoint(lat: string | null, lng: string | null): FocusPoint | null {
  if (lat === null || lng === null) return null
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null
  return { latitude, longitude }
}
