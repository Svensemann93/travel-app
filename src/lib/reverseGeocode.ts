export async function reverseGeocodeCountry(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url =
      'https://nominatim.openstreetmap.org/reverse' +
      `?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as { address?: { country_code?: string } }
    const code = data.address?.country_code
    return code ? code.toUpperCase() : null
  } catch {
    return null
  }
}
