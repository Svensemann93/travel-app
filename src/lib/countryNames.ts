const cache = new Map<string, Intl.DisplayNames>()

function displayNames(lang: string): Intl.DisplayNames | null {
  const cached = cache.get(lang)
  if (cached) return cached
  try {
    const names = new Intl.DisplayNames([lang], { type: 'region' })
    cache.set(lang, names)
    return names
  } catch {
    return null
  }
}

export function countryName(code: string, lang: string): string {
  try {
    return displayNames(lang)?.of(code) ?? code
  } catch {
    return code
  }
}
