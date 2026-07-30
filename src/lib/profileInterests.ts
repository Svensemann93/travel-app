const MAX_ITEMS = 10
const MAX_LENGTH = 30

export function normalizeInterests(values: string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const value of values) {
    const trimmed = value.trim().slice(0, MAX_LENGTH)
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
    if (result.length >= MAX_ITEMS) break
  }
  return result
}
