const LOCALE_MAP: Record<string, string> = {
  de: 'de-CH',
  en: 'en-US',
}

export function resolveLocale(language: string): string {
  const base = language.split('-')[0]
  return LOCALE_MAP[base] ?? 'de-CH'
}
